pipeline {

    agent any


    environment {

        EC2_SSH_CREDENTIAL = 'ec2-ssh-key'

    }


    stages {


        stage('Load Configuration') {

            steps {

                script {

                    def config = load "scripts/config.groovy"

                    config.loadConfig()

                }

            }

        }



        stage('Build Docker Images') {

            steps {

                script {

                    def docker = load "scripts/docker.groovy"

                    docker.buildImages()

                }

            }

        }



        stage('Push Docker Images') {

            steps {

                script {

                    def docker = load "scripts/docker.groovy"

                    docker.pushImages()

                }

            }

        }



        stage('Terraform Provision EC2') {

            steps {

                script {

                    def terraform = load "scripts/terraform.groovy"

                    terraform.applyTerraform()

                }

            }

        }



        stage('Get EC2 IP') {

            steps {

                script {

                    def ec2 = load "scripts/ec2.groovy"

                    ec2.getIP()

                }

            }

        }



        stage('Wait For SSH') {

            steps {

                script {

                    def ec2 = load "scripts/ec2.groovy"

                    ec2.waitForSSH()

                }

            }

        }



        stage('Deploy Application') {

            steps {

                script {

                    def deploy = load "scripts/deploy.groovy"

                    deploy.deployStack()

                }

            }

        }



        stage('Verify Deployment') {


            steps {

                script {

                    def verify = load "scripts/verify.groovy"

                    verify.check()

                }

            }

        }


    }



    post {


        success {

            echo "Todo 3 Tier Application Deployed Successfully"

        }


        failure {

            echo "Deployment Failed"

        }

    }


}
