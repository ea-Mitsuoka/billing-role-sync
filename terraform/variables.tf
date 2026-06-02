variable "project_id" {
  description = "GCPプロジェクトID"
  type        = string
}

variable "region" {
  description = "デプロイ先リージョン"
  type        = string
  default     = "asia-northeast1"
}

variable "parent_billing_account_id" {
  description = "親請求先アカウントID"
  type        = string
}

variable "your_domain" {
  description = "自社ドメイン（権限変更の除外対象）"
  type        = string
}

variable "image_tag" {
  description = "コンテナイメージのタグ"
  type        = string
  default     = "latest"
}
