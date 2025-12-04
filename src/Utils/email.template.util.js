// Utils/email.template.util.js
export const emailTemplate = ({ subject = "", message = {} } = {}) => {
  // ensure message is always an object
  const safeMessage = typeof message === "object" && message !== null ? message : {};

  const text = safeMessage.text || "";
  const htmlContent = safeMessage.html || "";
  const data = safeMessage.data || null;

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8f8f8;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px;">

        <h2 style="color: #333; margin-bottom: 15px;">${subject}</h2>

        ${
          htmlContent
            ? htmlContent
            : `<p style="font-size: 16px; color: #555;">${text}</p>`
        }

        ${
          data
            ? `<div style="margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 6px;">
                 <pre style="white-space: pre-wrap; font-size: 14px; color: #333;">${JSON.stringify(
                   data,
                   null,
                   2
                 )}</pre>
               </div>`
            : ""
        }

        <p style="margin-top: 25px; font-size: 14px; color: #888;">
          This is an automated message — please do not reply.
        </p>

      </div>
    </div>
  `;
};
