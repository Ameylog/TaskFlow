export const passwordResetTemplate = (to: string, resetUrl: string) => {
    return `
    <mjml>
      <mj-head>
        <mj-font
          name="Poppins"
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
        />
        <mj-preview>Reset your password securely</mj-preview>
      </mj-head>

      <mj-body background-color="#f4f7fb">
        <mj-section padding="30px 16px">
          <mj-column>
            <mj-text
              font-family="Poppins, Arial, sans-serif"
              font-size="22px"
              font-weight="700"
              color="#0f172a"
              align="center"
            >
              Reset Password
            </mj-text>
            <mj-text
              font-family="Poppins, Arial, sans-serif"
              font-size="14px"
              color="#475569"
              align="center"
            >
              Secure your account by setting a new password
            </mj-text>
          </mj-column>
        </mj-section>

        <mj-section background-color="#ffffff" border-radius="16px" padding="24px 20px">
          <mj-column>
            <mj-text
              font-family="Poppins, Arial, sans-serif"
              font-size="16px"
              color="#0f172a"
              line-height="24px"
            >
              We received a request to reset the password for <strong>${to}</strong>.
            </mj-text>

            <mj-text
              font-family="Poppins, Arial, sans-serif"
              font-size="16px"
              color="#0f172a"
              line-height="24px"
            >
              Click the button below to continue:
            </mj-text>

            <mj-button
              background-color="#0ea5e9"
              color="#ffffff"
              font-family="Poppins, Arial, sans-serif"
              font-size="15px"
              font-weight="600"
              border-radius="10px"
              href="${resetUrl}"
            >
              Reset Password
            </mj-button>

            <mj-text
              font-family="Poppins, Arial, sans-serif"
              font-size="13px"
              color="#64748b"
              line-height="20px"
              padding-top="16px"
            >
              This reset link will expire in 15 minutes. If you did not request this, you can safely ignore this email.
            </mj-text>

            <mj-divider border-color="#e2e8f0" padding-top="8px" />

            <mj-text
              font-family="Poppins, Arial, sans-serif"
              font-size="12px"
              color="#94a3b8"
              line-height="18px"
            >
              If the button does not work, copy and paste this URL into your browser:
            </mj-text>

            <mj-text
              font-family="Poppins, Arial, sans-serif"
              font-size="12px"
              color="#0ea5e9"
              line-height="18px"
            >
              ${resetUrl}
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;
};
