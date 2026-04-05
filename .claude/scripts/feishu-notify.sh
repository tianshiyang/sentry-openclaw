#!/bin/bash

# 读取输入数据
input=$(cat)

# 解析JSON数据
if command -v jq >/dev/null 2>&1; then
    session_id=$(echo "$input" | jq -r '.session_id // "unknown"')
    project_dir=$(echo "$input" | jq -r '.cwd // "unknown"')
    hook_event=$(echo "$input" | jq -r '.hook_event_name // "unknown"')
    tool_name=$(echo "$input" | jq -r '.tool_name // ""')
else
    session_id="unknown"
    project_dir=$(pwd)
    hook_event="Stop"
    tool_name=""
fi

# 提取项目信息
project_name=$(basename "$project_dir")
completion_time=$(date '+%H:%M:%S')
session_short=${session_id:0:8}

# 根据不同事件构造消息
case $hook_event in
    "Stop")
        message="🎉 Claude Code任务完成！ 📁 项目：$project_name ⏰ 时间：$completion_time 🔗 会话：$session_short"
        ;;
    "PostToolUse")
        message="🛠️ 工具执行完成：$tool_name 📁 项目：$project_name ⏰ 时间：$completion_time"
        ;;
    *)
        message="📢 Claude Code事件通知：$hook_event 📁 项目：$project_name ⏰ 时间：$completion_time"
        ;;
esac

# 构造JSON并发送
webhook_url="https://www.feishu.cn/flow/api/trigger-webhook/8862fecc4baa905d8b5fdfcfcb58f47f" # 替换成实际飞书Webhook地址

if command -v jq >/dev/null 2>&1; then
    json_data=$(jq -n \
        --arg text "$message" \
        '{"msg_type": "text", "content": {"text": $text}}')
else
    escaped_message=$(echo "$message" | sed 's/"/\\"/g')
    json_data="{\"msg_type\":\"text\",\"content\":{\"text\":\"$escaped_message\"}}"
fi

# 发送通知
response=$(curl -s -X POST "$webhook_url" \
    -H "Content-Type: application/json" \
    -d "$json_data")

# 可选：记录日志
# echo "$(date): Hook触发 - $hook_event, 项目: $project_name" >> ~/.claude/hook.log
