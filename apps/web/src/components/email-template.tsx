import * as React from 'react';

interface EmailTemplateProps {
  otp: string;
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({ otp }) => (
  <div style={{ fontFamily: 'sans-serif', padding: '24px', backgroundColor: '#f9f9f9' }}>
    <table
      style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: '#fff',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 0 10px rgba(0,0,0,0.05)',
      }}
    >
      <tbody>
        <tr>
          <td>
            <h2 style={{ color: '#333' }}>Your OTP Code</h2>
            <p style={{ fontSize: '16px', color: '#555' }}>
              Use the OTP below to log in. It expires in 5 minutes.
            </p>
            <div style={{ margin: '24px 0', textAlign: 'center' }}>
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  backgroundColor: '#efefef',
                  padding: '16px 32px',
                  borderRadius: '6px',
                  letterSpacing: '4px',
                  display: 'inline-block',
                }}
              >
                {otp}
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#888' }}>
              If you didn’t request this, you can safely ignore this email.
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);
