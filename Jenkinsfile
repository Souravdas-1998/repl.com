pipeline {
    agent any

    environment {
        // Application
        APP_NAME         = "styleai-clothing-store"
        NODE_VERSION     = "24"

        // Docker / Registry
        REGISTRY         = credentials('DOCKER_REGISTRY')
        IMAGE_API        = "${REGISTRY}/${APP_NAME}-api"
        IMAGE_WEB        = "${REGISTRY}/${APP_NAME}-web"

        // AWS / Deployment (override per branch below)
        AWS_REGION       = "us-east-1"
        ECS_CLUSTER      = "styleai-cluster"
        ECS_SERVICE_API  = "styleai-api-service"
        ECS_SERVICE_WEB  = "styleai-web-service"

        // Secrets (set these as Jenkins credentials)
        DATABASE_URL     = credentials('DATABASE_URL')
        SESSION_SECRET   = credentials('SESSION_SECRET')
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
        ansiColor('xterm')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.BUILD_TAG        = "${env.BRANCH_NAME}-${env.GIT_COMMIT_SHORT}-${env.BUILD_NUMBER}"
                    env.IMAGE_TAG_API    = "${IMAGE_API}:${BUILD_TAG}"
                    env.IMAGE_TAG_WEB    = "${IMAGE_WEB}:${BUILD_TAG}"
                }
                echo "Building tag: ${env.BUILD_TAG}"
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    node --version
                    npm --version
                    npm install -g pnpm
                    pnpm install --frozen-lockfile
                '''
            }
        }

        stage('Lint & Type Check') {
            parallel {
                stage('TypeCheck') {
                    steps {
                        sh 'pnpm run typecheck'
                    }
                }
                stage('Codegen Verification') {
                    steps {
                        sh '''
                            pnpm --filter @workspace/api-spec run codegen
                            git diff --exit-code lib/api-client-react/src/generated lib/api-zod/src/generated \
                                || (echo "Generated files are out of sync. Run codegen and commit." && exit 1)
                        '''
                    }
                }
            }
        }

        stage('Build') {
            parallel {
                stage('Build API Server') {
                    steps {
                        sh 'pnpm --filter @workspace/api-server run build'
                    }
                }
                stage('Build Web App') {
                    environment {
                        NODE_ENV  = 'production'
                        BASE_PATH = '/'
                        PORT      = '3000'
                    }
                    steps {
                        sh 'pnpm --filter @workspace/clothing-store run build'
                    }
                }
            }
        }

        stage('Docker Build & Push') {
            when {
                anyOf {
                    branch 'main'
                    branch 'staging'
                    branch 'develop'
                }
            }
            parallel {
                stage('API Image') {
                    steps {
                        script {
                            docker.withRegistry("https://${REGISTRY}", 'DOCKER_CREDENTIALS') {
                                def img = docker.build("${IMAGE_TAG_API}", "-f docker/api.Dockerfile .")
                                img.push()
                                img.push("${env.BRANCH_NAME}-latest")
                            }
                        }
                    }
                }
                stage('Web Image') {
                    steps {
                        script {
                            docker.withRegistry("https://${REGISTRY}", 'DOCKER_CREDENTIALS') {
                                def img = docker.build("${IMAGE_TAG_WEB}", "-f docker/web.Dockerfile .")
                                img.push()
                                img.push("${env.BRANCH_NAME}-latest")
                            }
                        }
                    }
                }
            }
        }

        stage('Database Migration') {
            when { branch 'main' }
            environment {
                DATABASE_URL = credentials('DATABASE_URL_PROD')
            }
            steps {
                sh 'pnpm --filter @workspace/db run push'
            }
        }

        stage('Deploy — Staging') {
            when { branch 'staging' }
            environment {
                DATABASE_URL = credentials('DATABASE_URL_STAGING')
                ECS_CLUSTER  = 'styleai-cluster-staging'
            }
            steps {
                withAWS(credentials: 'AWS_CREDENTIALS', region: "${AWS_REGION}") {
                    sh """
                        aws ecs update-service \
                            --cluster ${ECS_CLUSTER} \
                            --service ${ECS_SERVICE_API} \
                            --force-new-deployment

                        aws ecs update-service \
                            --cluster ${ECS_CLUSTER} \
                            --service ${ECS_SERVICE_WEB} \
                            --force-new-deployment
                    """
                }
            }
        }

        stage('Deploy — Production') {
            when { branch 'main' }
            environment {
                DATABASE_URL = credentials('DATABASE_URL_PROD')
            }
            steps {
                // Require manual approval before prod deploy
                timeout(time: 10, unit: 'MINUTES') {
                    input message: "Deploy ${BUILD_TAG} to production?", ok: 'Deploy'
                }
                withAWS(credentials: 'AWS_CREDENTIALS', region: "${AWS_REGION}") {
                    sh """
                        aws ecs update-service \
                            --cluster ${ECS_CLUSTER} \
                            --service ${ECS_SERVICE_API} \
                            --force-new-deployment

                        aws ecs update-service \
                            --cluster ${ECS_CLUSTER} \
                            --service ${ECS_SERVICE_WEB} \
                            --force-new-deployment

                        aws ecs wait services-stable \
                            --cluster ${ECS_CLUSTER} \
                            --services ${ECS_SERVICE_API} ${ECS_SERVICE_WEB}
                    """
                }
            }
        }

        stage('Health Check') {
            when {
                anyOf { branch 'main'; branch 'staging' }
            }
            steps {
                script {
                    def endpoint = env.BRANCH_NAME == 'main'
                        ? env.PROD_URL
                        : env.STAGING_URL
                    retry(5) {
                        sleep(10)
                        sh "curl -f ${endpoint}/api/healthz"
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline succeeded for ${env.BUILD_TAG}"
            slackSend(
                channel: '#deployments',
                color: 'good',
                message: ":white_check_mark: *${APP_NAME}* `${env.BUILD_TAG}` deployed successfully on `${env.BRANCH_NAME}`"
            )
        }
        failure {
            echo "Pipeline FAILED for ${env.BUILD_TAG}"
            slackSend(
                channel: '#deployments',
                color: 'danger',
                message: ":x: *${APP_NAME}* `${env.BUILD_TAG}` FAILED on `${env.BRANCH_NAME}`. <${env.BUILD_URL}|View Build>"
            )
        }
        always {
            cleanWs()
        }
    }
}
