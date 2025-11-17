'use server'

export async function translateText(text: string, targetLanguage: string) {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) throw new Error("Missing Google Translate API key");

    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        q: text,
        target: targetLanguage,
        format: "text",
        }),
    });

    const data = await res.json();

    if (data.error) {
        throw new Error(data.error.message);
    }

    return data.data.translations[0].translatedText;
}
