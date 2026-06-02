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
  description = "除外対象の自社ドメイン（カンマ区切りで複数指定可。例: e-agency.co.jp,group-company.co.jp）"
  type        = string
}

variable "image_tag" {
  description = "コンテナイメージのタグ"
  type        = string
  default     = "latest"
}
