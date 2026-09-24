pipeline {
    agent none

    options {
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
    }

    parameters {
        string(name: 'API_URL',
               defaultValue: 'http://localhost:5000/api/v1',
               description: 'NEXT_PUBLIC_API_URL (se inlinea en el bundle durante el build)')
        booleanParam(name: 'RUN_SONAR', defaultValue: true,
                     description: 'Ejecutar análisis de SonarCloud')
        booleanParam(name: 'PUSH_IMAGE', defaultValue: true,
                     description: 'Publicar la imagen en Docker Hub (solo rama main)')
    }

    environment {
        IMAGE_NAME              = 'homara-frontend'
        NEXT_PUBLIC_API_URL     = "${params.API_URL}"
        NEXT_TELEMETRY_DISABLED = '1'
        CI                      = 'true'
    }

    stages {

        stage('CI (Node 20)') {
            agent {
                docker {
                    image 'node:20-alpine'
                    reuseNode true
                }
            }
            environment {
                HOME             = "${env.WORKSPACE}"
                npm_config_cache = "${env.WORKSPACE}/.npm"
            }
            stages {
                stage('Instalar dependencias') {
                    steps {
                        sh 'node --version && npm --version'
                        sh 'npm ci'
                    }
                }

                stage('Lint y pruebas') {
                    parallel {
                        stage('Lint (ESLint)') {
                            steps {
                                sh 'npm run lint'
                            }
                        }
                        stage('Tests + cobertura (Vitest)') {
                            steps {
                                sh 'npm run test:coverage'
                            }
                            post {
                                always {
                                    archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: true
                                }
                            }
                        }
                    }
                }

                stage('Build (Next.js)') {
                    steps {
                        sh 'npm run build'
                    }
                }

                stage('SonarCloud') {
                    when { expression { return params.RUN_SONAR } }
                    steps {
                        // Credencial tipo "Secret text" con el token de SonarCloud
                        withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                            sh '''
                                npx --yes @sonar/scan \
                                  -Dsonar.host.url=https://sonarcloud.io \
                                  -Dsonar.token=$SONAR_TOKEN \
                                  -Dsonar.scm.revision=$GIT_COMMIT
                            '''
                        }
                    }
                }
            }
        }

        stage('Docker build & push') {
            agent any
            when {
                expression {
                    // Multibranch usa BRANCH_NAME; un Pipeline normal usa GIT_BRANCH (origin/main)
                    return env.BRANCH_NAME == 'main' || env.GIT_BRANCH == 'origin/main'
                }
            }
            steps {
                script {
                    env.SHORT_SHA = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                }
                // Credencial tipo "Username with password" de Docker Hub
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials',
                                                  usernameVariable: 'DOCKER_USER',
                                                  passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        IMAGE="$DOCKER_USER/$IMAGE_NAME"
                        docker build \
                          --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
                          -t "$IMAGE:$SHORT_SHA" \
                          -t "$IMAGE:latest" .
                    '''
                    script {
                        if (params.PUSH_IMAGE) {
                            sh '''
                                IMAGE="$DOCKER_USER/$IMAGE_NAME"
                                echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                                docker push "$IMAGE:$SHORT_SHA"
                                docker push "$IMAGE:latest"
                                docker logout
                            '''
                        } else {
                            echo 'PUSH_IMAGE=false: se omite la publicación en Docker Hub.'
                        }
                    }
                }
            }
            post {
                always {
                    sh 'docker image prune -f || true'
                }
            }
        }
    }

    post {
        success { echo '✅ Pipeline completado correctamente.' }
        failure { echo '❌ El pipeline falló. Revisa los logs de la etapa fallida.' }
        cleanup { echo 'Pipeline finalizado.' }
    }
}
