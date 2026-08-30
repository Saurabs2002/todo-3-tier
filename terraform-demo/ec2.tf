# VPC

resource "aws_vpc" "my_vpc" {
  cidr_block = var.vpc_cidr

  tags = {
    Name = var.vpc_name
  }
}


# Public Subnet

resource "aws_subnet" "my_public_sub" {
  vpc_id                  = aws_vpc.my_vpc.id
  cidr_block              = var.public_subnet_cidr
  availability_zone       = var.public_availability_zone
  map_public_ip_on_launch = true

  tags = {
    Name = var.public_subnet_name
  }
}


# Internet Gateway

resource "aws_internet_gateway" "ig" {
  vpc_id = aws_vpc.my_vpc.id

  tags = {
    Name = var.internet_gateway_name
  }
}


# Public Route Table

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.my_vpc.id

  route {
    cidr_block = var.internet_cidr
    gateway_id = aws_internet_gateway.ig.id
  }

  tags = {
    Name = var.public_route_table_name
  }
}


# Route Table Association

resource "aws_route_table_association" "public_rta" {
  subnet_id      = aws_subnet.my_public_sub.id
  route_table_id = aws_route_table.public_rt.id
}


# Security Group

resource "aws_security_group" "my_sg" {
  name        = var.security_group_name
  description = var.security_group_description
  vpc_id      = aws_vpc.my_vpc.id

  # SSH
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip]
  }
   ingress {
    description = "HTTP"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [var.internet_cidr]
  }
 ingress {
    description = "HTTP"
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = [var.internet_cidr]
  }
ingress {
    description = "HTTP"
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = [var.internet_cidr]
  }

  # HTTP
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [var.internet_cidr]
  }
ingress {
    description = "HTTP"
    from_port   = 8001
    to_port     = 8001
    protocol    = "tcp"
    cidr_blocks = [var.internet_cidr]
  }

  # Outbound
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.internet_cidr]
  }
ingress {
    description = "HTTP"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = [var.internet_cidr]
  }

  tags = {
    Name = var.security_group_name
  }
}
resource "aws_key_pair" "deployer" {
  key_name   = var.key_name
  public_key = file("${path.module}/terraform-key.pub")
}

# EC2

resource "aws_instance" "my_ec2" {
  ami           = var.ami_id
  instance_type = var.instance_type

  subnet_id = aws_subnet.my_public_sub.id

  vpc_security_group_ids = [
    aws_security_group.my_sg.id
  ]

  key_name = aws_key_pair.deployer.key_name
   root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = {
    Name = var.ec2_name
  }
}
