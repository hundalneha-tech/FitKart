# FitKart AWS Infrastructure as Code (Terraform)
# Deploy FitKart infrastructure to AWS with a single command
# 
# Prerequisites:
# 1. Install Terraform: https://www.terraform.io/downloads.html
# 2. Configure AWS credentials: aws configure
# 
# Usage:
# terraform init
# terraform plan
# terraform apply

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ============================================
# Variables
# ============================================

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"  # Free tier eligible
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "fitkart"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "www.fitkart.club"
}

variable "admin_email" {
  description = "Admin email for notifications"
  type        = string
}

# ============================================
# Security Groups
# ============================================

resource "aws_security_group" "fitkart_sg" {
  name        = "${var.app_name}-sg"
  description = "Security group for FitKart"

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # ⚠️ Restrict this to your IP in production
  }

  # HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Backend API
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Prometheus (internal only)
  ingress {
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Grafana (internal only)
  ingress {
    from_port   = 3002
    to_port     = 3002
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Egress (allow all outbound)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-sg"
  }
}

# ============================================
# Key Pair
# ============================================

resource "aws_key_pair" "fitkart_key" {
  key_name   = "${var.app_name}-${var.environment}"
  public_key = file("~/.ssh/id_rsa.pub")  # Update path to your public key

  tags = {
    Name = "${var.app_name}-key"
  }
}

# ============================================
# EC2 Instance
# ============================================

resource "aws_instance" "fitkart_app" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.fitkart_key.key_name
  vpc_security_group_ids = [aws_security_group.fitkart_sg.id]

  # User data script (runs on first launch)
  user_data = base64encode(file("${path.module}/scripts/aws-init-server.sh"))

  root_block_device {
    volume_type           = "gp2"
    volume_size           = 30  # 30 GB
    delete_on_termination = true
  }

  monitoring              = true
  associate_public_ip_address = true

  tags = {
    Name        = "${var.app_name}-${var.environment}"
    Environment = var.environment
    Project     = var.app_name
  }
}

# ============================================
# Elastic IP
# ============================================

resource "aws_eip" "fitkart_eip" {
  instance = aws_instance.fitkart_app.id
  domain   = "vpc"

  tags = {
    Name = "${var.app_name}-eip"
  }

  depends_on = [aws_instance.fitkart_app]
}

# ============================================
# CloudWatch Alarms
# ============================================

resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "${var.app_name}-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "Alarm when CPU exceeds 80%"
  alarm_actions       = []  # Add SNS topic if needed

  dimensions = {
    InstanceId = aws_instance.fitkart_app.id
  }
}

resource "aws_cloudwatch_metric_alarm" "disk_high" {
  alarm_name          = "${var.app_name}-disk-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DiskUtilization"
  namespace           = "AWS/EC2"
  period              = "300"
  statistic           = "Average"
  threshold           = "85"
  alarm_description   = "Alarm when disk exceeds 85%"
  alarm_actions       = []

  dimensions = {
    InstanceId = aws_instance.fitkart_app.id
  }
}

# ============================================
# Data Sources
# ============================================

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]  # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ============================================
# Outputs
# ============================================

output "instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.fitkart_app.id
}

output "instance_public_ip" {
  description = "EC2 Instance Public IP"
  value       = aws_eip.fitkart_eip.public_ip
}

output "instance_public_dns" {
  description = "EC2 Instance Public DNS"
  value       = aws_instance.fitkart_app.public_dns
}

output "ssh_command" {
  description = "SSH command to connect to instance"
  value       = "ssh -i ~/.ssh/fitkart-prod.pem ubuntu@${aws_eip.fitkart_eip.public_ip}"
}

output "security_group_id" {
  description = "Security Group ID"
  value       = aws_security_group.fitkart_sg.id
}
