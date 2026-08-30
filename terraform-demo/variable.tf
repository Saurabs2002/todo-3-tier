variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "vpc_name" {
  type    = string
  default = "three-tier-vpc"
}
variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "public_subnet_cidr" {
  type    = string
  default = "10.0.1.0/24"
}

variable "public_availability_zone" {
  type    = string
  default = "ap-south-1a"
}

variable "public_subnet_name" {
  type    = string
  default = "three-tier-public-subnet"
}

variable "internet_gateway_name" {
  type    = string
  default = "three-tier-igw"
}

variable "public_route_table_name" {
  type    = string
  default = "public-route-table"
}

variable "internet_cidr" {
  type    = string
  default = "0.0.0.0/0"
}

variable "security_group_name" {
  type    = string
  default = "three-tier-ec2-sg"
}

variable "security_group_description" {
  type    = string
  default = "Security group for three-tier EC2"
}

variable "my_ip" {
  type    = string
  default = "0.0.0.0/0"
}

variable "key_name" {
  type    = string
  default = "my-ec2-key"
}


variable "ec2_name" {
  type    = string
  default = "three-tier-ec2"
}

variable "ami_id" {
  type = string
}

variable "instance_type" {
  type = string
}
