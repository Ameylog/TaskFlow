
export const taskAssignedTemplate = (
  userName: string,
  taskTitle: string,
  dueDate: string | null,
  taskUrl: string,
  actorName?: string
) => {
  const assignmentCopy = actorName
    ? `${actorName} assigned a task to you`
    : "A task has been assigned to you";

  const safeDueDate =
    dueDate && !/invalid/i.test(dueDate.trim()) ? dueDate : "No due date";

  return `
    <mjml>
      <mj-head>
        <mj-preview>A new task has been assigned to you</mj-preview>
      </mj-head>

      <mj-body background-color="#F4F5F7">
        <mj-section padding="24px 16px 12px">
          <mj-column>
            <mj-text
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
              font-size="12px"
              font-weight="700"
              color="#0052CC"
              align="left"
              text-transform="uppercase"
              letter-spacing="0.8px"
              padding="0 0 8px"
            >
              Task assigned
            </mj-text>
            <mj-text
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
              font-size="24px"
              font-weight="600"
              color="#172B4D"
              align="left"
              line-height="32px"
              padding="0 0 6px"
            >
              ${taskTitle}
            </mj-text>
            <mj-text
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
              font-size="14px"
              color="#44546F"
              align="left"
              line-height="20px"
              padding="0"
            >
              ${assignmentCopy}
            </mj-text>
          </mj-column>
        </mj-section>

        <mj-section
          background-color="#FFFFFF"
          border="1px solid #DFE1E6"
          border-bottom="0"
          border-radius="8px 8px 0 0"
          padding="20px 24px 16px"
        >
          <mj-column>
            <mj-text
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
              font-size="12px"
              font-weight="600"
              color="#6B778C"
              text-transform="uppercase"
              letter-spacing="0.5px"
              padding="0 0 10px"
            >
              Assignee
            </mj-text>
            <mj-text
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
              font-size="16px"
              font-weight="600"
              color="#172B4D"
              line-height="24px"
              padding="0"
            >
              ${userName}
            </mj-text>
          </mj-column>
        </mj-section>

        <mj-section
          background-color="#ffffff"
          border="1px solid #DFE1E6"
          border-top="0"
          border-bottom="0"
          padding="0 24px"
        >
          <mj-column>
            <mj-text
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
              font-size="14px"
              color="#172B4D"
              line-height="22px"
              padding="0 0 20px"
            >
              Hello ${userName},<br />
              Please review the task details below. This email is to let you know that the item has been assigned to you.
            </mj-text>
          </mj-column>
        </mj-section>

        <mj-section
          background-color="#ffffff"
          border="1px solid #DFE1E6"
          border-top="0"
          border-bottom="0"
          padding="0 24px"
        >
          <mj-column width="50%">
            <mj-text
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
              font-size="12px"
              font-weight="600"
              color="#6B778C"
              text-transform="uppercase"
              letter-spacing="0.4px"
              padding="0 0 8px"
            >
              Due date
            </mj-text>
            <mj-text
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
              font-size="14px"
              color="#172B4D"
              line-height="20px"
              padding="0 0 20px"
            >
              ${safeDueDate}
            </mj-text>
          </mj-column>
          <mj-column width="50%">
            <mj-text
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
              font-size="12px"
              font-weight="600"
              color="#6B778C"
              text-transform="uppercase"
              letter-spacing="0.4px"
              padding="0 0 8px"
            >
              Action
            </mj-text>
            <mj-button
              background-color="#0052CC"
              color="#FFFFFF"
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
              font-size="14px"
              font-weight="600"
              border-radius="4px"
              href="${taskUrl}"
              inner-padding="10px 16px"
              align="left"
              padding="0 0 20px"
            >
              View task
            </mj-button>
          </mj-column>
        </mj-section>

        <mj-section
          background-color="#ffffff"
          border="1px solid #DFE1E6"
          border-top="0"
          border-radius="0 0 8px 8px"
          padding="0 24px 24px"
        >
          <mj-column>
            <mj-text
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
              font-size="13px"
              color="#44546F"
              line-height="20px"
              padding="0 0 16px"
            >
              Open the task to review details, update progress, and collaborate with your team.
            </mj-text>

            <mj-divider border-color="#EBECF0" padding="0 0 16px" />

            <mj-text
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
              font-size="12px"
              color="#6B778C"
              line-height="18px"
              padding-bottom="6px"
            >
              If the button above does not work, copy and paste this link into your browser:
            </mj-text>

            <mj-text
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
              font-size="12px"
              color="#0052CC"
              line-height="18px"
              padding="0"
            >
              ${taskUrl}
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;
};


// <mj-section
//   background-color="#ffffff"
//   border="1px solid #DFE1E6"
//   border-top="0"
//   border-bottom="0"
//   padding="0 24px"
// >
//   <mj-column>
//     <mj-text
//       font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
//       font-size="12px"
//       font-weight="600"
//       color="#6B778C"
//       text-transform="uppercase"
//       letter-spacing="0.4px"
//       padding="0 0 8px"
//     >
//       Summary
//     </mj-text>
//     <mj-text
//       font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
//       font-size="16px"
//       font-weight="600"
//       color="#172B4D"
//       line-height="24px"
//       padding="0 0 20px"
//     >
//       ${taskTitle}
//     </mj-text>
//   </mj-column>
// </mj-section>