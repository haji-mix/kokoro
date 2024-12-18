
const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports["config"] = {
    name: "gpt4of",
    aliases: ["gpt4o", "gpt4"],
    version: "1.0.0",
    credits: "Kenneth Panio",
    role: 0,
    isPrefix: false,
    type: "artificial-intelligence",
    info: "Interact with GPT-4o Free using the API. Specialized in answering queries, generating files, sending images, and more.",
    usage: "[prompt]",
    guide: "gpt4of How does quantum computing work?",
    cd: 6
};

const conversationHistories = {};

module.exports["run"] = async ({
    chat, args, event, font, global
}) => {
    const mono = txt => font.monospace(txt);
    const {
        senderID
    } = event;
    let query = args.join(" ");

    if (!query) return chat.reply(font.thin("Please provide a text to ask. e.g: ai explain the theory of relativity"));

    if (['clear', 'reset', 'forgot', 'forget'].includes(query.toLowerCase())) {
        conversationHistories[senderID] = [];
        chat.reply(mono("Conversation history cleared."));
        return;
    }

    const answering = await chat.reply(mono("🕐 | Generating Response..."));

    conversationHistories[senderID] = conversationHistories[senderID] || [];
    conversationHistories[senderID].push({
        role: "user", content: query
    });
    
        const captchaToken = `P1_${[...Array(30)].map(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".charAt(Math.floor(Math.random() * 64))).join("")}.${[...Array(256)].map(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".charAt(Math.floor(Math.random() * 64))).join("")}.${[...Array(43)].map(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".charAt(Math.floor(Math.random() * 64))).join("")}`;

    const apiUrl = global.api.eqing + `/api/openai/v1/chat/completions`;

    const headers = {
        'Content-Type': 'application/json',
        'x-requested-with': 'XMLHttpRequest',
        'useSearch': 'undefined',
        'x-guest-id': 'LKkc7B5BECo6_nFmyLhFw',
        'accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://origin.eqing.tech/#/chat'
    };

    const data = {
        "messages": conversationHistories[senderID],
        "stream": true,
        "model": "gpt-4o-free",
        "temperature": 0.5,
        "presence_penalty": 0,
        "frequency_penalty": 0,
        "top_p": 1,
        "max_tokens": 28000,
        "captchaToken": "eyJhbGdvcml0aG0iOiJTSEEtNTEyIiwiY2hhbGxlbmdlIjoiOWIzNGEzZGRjMzUyY2NiMGM2N2NlMTY2MmJkMGI1ZDY1NTA5MTM3YzI1OGVlYTNlNjI2ZThhYzNhZWI2MDBlNzAxMjAwMzZjYjU2YmYxNzk4NjU5ODUyY2YyN2Y4N2Q2MDBmNjBiZmM4NDcyZjZmMmIyYWI0NmI0MmQ1YmUyYTYiLCJudW1iZXIiOjg4NjM2Nywic2FsdCI6IjRmNDk2MzY0ZmQ4N2M3MzAxOTk0YTYwYjIzYmU3MWE2MDgyYTExMjc/ZXhwaXJlcz0xNzM0NTc5OTQ5Iiwic2lnbmF0dXJlIjoiZjZhZjk5M2NmYmFmMGZlNGY0Nzk0ZGZhOWRkMmZlZTVkMzQ0N2NjYzVkYzljNjRiNjNkZTE2YmVmM2RjMjhkZjgxYmJmYjI4OWE5NTVhMWIwNzgyZjVlNDdiZjk1ZDU1YzYxNTUyMWI4MGE4ZDA4NTI0YjI3NTMwNzZlMGE5YjEiLCJ0b29rIjoxODYwMX0="
    };

    try {
        const response = await axios.post(apiUrl, data, {
            headers
        });
        const rawResponse = response.data;

        // Process scattered JSON messages
        const lines = rawResponse.split('\n');
        let fullContent = '';

        for (const line of lines) {
            if (line.trim() === "data: [DONE]") {
                break; // End processing on [DONE]
            }

            if (line.trim().startsWith("data:")) {
                const jsonString = line.substring(5).trim();
                if (jsonString) {
                    try {
                        const parsed = JSON.parse(jsonString);
                        const delta = parsed.choices[0].delta?.content || '';
                        fullContent += delta;
                    } catch (err) {
                        console.error("Error parsing JSON:", err.message);
                    }
                }
            }
        }

        fullContent = fullContent
        .replace(/> provided by \[EasyChat\]\(https:\/\/site\.eqing\.tech\/\)/g, '').trim();
        conversationHistories[senderID].push({
            role: "assistant", content: fullContent
        });

        const line = "\n" + '━'.repeat(18) + "\n";
        const formattedAnswer = fullContent.replace(/\*\*(.*?)\*\*/g, (_, text) => font.bold(text));
        const message = font.bold(`🗞️ | ${data.model.toUpperCase()}`) + line + formattedAnswer + line + mono(`◉ USE "CLEAR" TO RESET CONVERSATION.`);
        answering.edit(message);
    } catch (error) {
        console.error("Error during request:", error.response?.data || error.message);
        answering.edit(mono("No response from GPT-4o AI. Please try again later."));
    }
};