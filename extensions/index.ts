// ~/.pi/agent/extensions/ask-user-question/index.ts
import type { ExtensionAPI } from '@mariozechner/pi-coding-agent';
import { Type } from '@sinclair/typebox';

const OTHER_OPTION = 'Other';

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: 'askUserQuestion',
    label: 'Ask User',
    description: `Ask the user a clarifying question before proceeding.
Use this when you need a decision from the user about approach, architecture,
preferences, or any ambiguity that would affect the outcome. Present clear,
mutually exclusive options when possible.`,

    // Hint that appears in the system prompt so the model knows when to use it
    promptSnippet:
      'askUserQuestion - pause and ask the user a clarifying question',
    promptGuidelines:
      'Use askUserQuestion before taking irreversible actions or when approach is ambiguous.',

    parameters: Type.Object({
      question: Type.String({
        description: 'The question to ask the user',
      }),
      options: Type.Optional(
        Type.Array(Type.String(), {
          description:
            'Multiple-choice options. Omit for free-text answer. When options are provided, the UI also adds an Other choice for free-text answers.',
        })
      ),
    }),

    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      // Guard: non-interactive environments (RPC/print mode) get a fallback
      if (!ctx.hasUI) {
        return {
          content: [
            {
              type: 'text',
              text: `[askUserQuestion] No interactive UI available. Question was: "${params.question}". Please proceed with your best judgment.`,
            },
          ],
          details: {},
        };
      }

      let answer: string | null;

      if (params.options && params.options.length > 0) {
        // Multiple-choice path with an escape hatch for free-text answers.
        const selectOptions = params.options.includes(OTHER_OPTION)
          ? params.options
          : [...params.options, OTHER_OPTION];

        answer = await ctx.ui.select(params.question, selectOptions);

        if (answer === OTHER_OPTION) {
          answer = await ctx.ui.input(params.question, 'Type your answer...');
        }
      } else {
        // Free-text path — for open-ended questions
        answer = await ctx.ui.input(params.question, 'Type your answer...');
      }

      if (answer === null) {
        // User dismissed (Escape)
        return {
          content: [
            {
              type: 'text',
              text: 'The user dismissed the question without answering. Use your best judgment or ask again.',
            },
          ],
          details: { question: params.question, answer: null },
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `User answered: ${answer}`,
          },
        ],
        details: { question: params.question, answer },
      };
    },
  });
}
