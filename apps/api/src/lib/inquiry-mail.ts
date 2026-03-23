type InquiryMailInput = {
    siteId: number
    senderName: string
    senderEmail: string
    payload: Record<string, string>
    resendApiKey?: string
}

type InquiryMailResult = {
    delivered: boolean
    mocked: boolean
    skipped?: boolean
}

export async function sendInquiryNotificationEmail({
    siteId,
    senderName,
    senderEmail,
    payload,
    resendApiKey,
}: InquiryMailInput): Promise<InquiryMailResult> {
    if (siteId !== 2) {
        return {
            delivered: false,
            mocked: false,
            skipped: true,
        }
    }

    const category = payload.inquiry_category_label || payload.inquiry_type || 'Genel İletişim'
    const subject = `[Atago TR Destek Talebi] - ${category}`
    const formData = {
        senderName,
        senderEmail,
        category,
        subject,
        message: payload.message || '',
        payload,
    }

    try {
        if (!resendApiKey) {
            console.log('Resend API tetiklendi: Mail sent to info@for-labs.com', formData)
            return {
                delivered: true,
                mocked: true,
            }
        }

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'For-Labs <onboarding@resend.dev>',
                to: ['info@for-labs.com'],
                subject,
                text: [
                    `Kategori: ${category}`,
                    `Gönderen: ${senderName}`,
                    `E-posta: ${senderEmail}`,
                    `Konu: ${payload.subject || ''}`,
                    '',
                    payload.message || '',
                ].join('\n'),
            }),
        })

        if (!response.ok) {
            throw new Error(`Resend request failed with status ${response.status}`)
        }

        console.log('Resend API tetiklendi: Mail sent to info@for-labs.com', formData)

        return {
            delivered: true,
            mocked: false,
        }
    } catch (error) {
        console.error('Inquiry notification mail failed', error)
        return {
            delivered: false,
            mocked: Boolean(!resendApiKey),
        }
    }
}
