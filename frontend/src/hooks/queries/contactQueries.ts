import { useMutation } from '@tanstack/react-query';

// Contact API functions
const contactApiFunctions = {
  async sendMessage(data: Record<string, string>) {
    const response = await fetch('/api/v1/contact/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send message');
    }

    return response.json();
  },
};

// Mutations
export const useSendMessage = () => {
  return useMutation({
    mutationFn: contactApiFunctions.sendMessage,
  });
};
