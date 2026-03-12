resource "aws_cloudfront_distribution" "app" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.app_name} distribution"
  default_root_object = ""
  price_class         = "PriceClass_100" # US, Canada, Europe only — cheapest

  # Origin: your EC2 instance
  origin {
    domain_name = var.ec2_public_dns
    origin_id   = "${var.app_name}-ec2-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only" # EC2 serves HTTP; CloudFront handles HTTPS
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Default cache behaviour
  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "${var.app_name}-ec2-origin"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    # Pass these headers to origin (required for Next.js App Router)
    forwarded_values {
      query_string = true
      headers      = ["Host", "Accept", "RSC", "Next-Router-State-Tree", "Next-Url", "Next-Router-Prefetch"]

      cookies {
        forward = "all"
      }
    }

    min_ttl     = 0
    default_ttl = 0    # Don't cache by default — let Next.js control caching
    max_ttl     = 86400
  }

  # Cache static assets aggressively
  ordered_cache_behavior {
    path_pattern           = "/_next/static/*"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "${var.app_name}-ec2-origin"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    min_ttl     = 86400    # 1 day
    default_ttl = 2592000  # 30 days
    max_ttl     = 31536000 # 1 year
  }

  # Cache public images
  ordered_cache_behavior {
    path_pattern           = "/images/*"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "${var.app_name}-ec2-origin"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    min_ttl     = 3600
    default_ttl = 86400
    max_ttl     = 604800
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true # Uses *.cloudfront.net cert for free
  }

  tags = {
    Name = "${var.app_name}-cloudfront"
  }
}
