export function streamAiChat(content, loading) {
    // data.model = "Qwen/Qwen2.5-Coder-7B-Instruct";

    return uni.request({
        url: "https://api.siliconflow.cn/v1/chat/completions",
        method: "POST",
        data: {
            messages: [{
                content,
                role: "user",
            }],
            model: "deepseek-ai/DeepSeek-V3"
        },
        loading: loading,
        header: {
            "Content-Type": "application/json",
            Authorization: "Bearer sk-gdixbljijaqyykmjmvyovjkenpinkvqkdobdtgrzrzhzdtzl",
        },
    });
}