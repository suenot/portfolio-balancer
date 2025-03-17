export async function getMessages(locale: string) {
  try {
    return (await import(`@/messages/${locale}/index.json`)).default;
  } catch (error) {
    // В случае ошибки возвращаем сообщения для языка по умолчанию
    return (await import(`@/messages/en/index.json`)).default;
  }
} 