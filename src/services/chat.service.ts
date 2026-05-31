

export async function generateDescriptionForTodo(userId: number, title: string) {
    if (!userId) {
        throw new Error("User ID is required to generate description");
    }

    if (!title) {
        throw new Error("Title is required to generate description");
    }


    const payload = {
        model: "qwen3.5-0.8b",
        system_prompt: `You are a task management assistant. Your goal is to generate a concise, informative description for a todo item based on its title.

        ### OUTPUT RULES:
        - Format: Use ONLY valid Markdown.
        - Lists: Use '*' for all bullet points.
        - Bold: Use '**' for key terms.
        - Headers: Use '###' for section titles if needed.
        - Constraint: Do not include the title.
        - Preamble: Provide ONLY the markdown. No "Here is your description" intro.
        
        Guidelines:
        - Length: Exactly 4-5 sentences or bullet points, try to generate in bullet points.
        - Content: Focus on actionable steps, necessary context, or potential outcomes of the task.
        - Constraint: Do NOT include the task title itself in the description.
        - Tone: Professional and direct.
        `,
        input: `${title}`
    };

    const res = await fetch("http://localhost:1234/api/v1/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
    })
    const data = await res.json()
    return data;
}
