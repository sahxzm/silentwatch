'use server';
/**
 * @fileOverview An AI flow for analyzing open windows for suspicious overlays or behavior.
 *
 * - analyzeWindows - A function that takes a list of windows and returns an analysis.
 * - WindowAnalysisInput - The input type for the analyzeWindows function.
 * - WindowAnalysisOutput - The return type for the analyzeWindows function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const WindowAnalysisInputSchema = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
    class: z.string(),
    properties: z.array(z.string()),
  })
);

const WindowInfoSchema = z.object({
  id: z.number().describe('The window ID.'),
  name: z.string().describe('The name/title of the window.'),
  class: z.string().describe('The window class name.'),
  properties: z.array(z.string()).describe('A list of window properties (e.g., WS_VISIBLE).'),
  status: z.enum(['Visible', 'Hidden', 'Off-Screen', 'Transparent']).describe("The determined status of the window. Use 'Transparent' if it has layered or transparent properties. Use 'Hidden' if it's a tool window or not visible. Use 'Off-Screen' if its coordinates are outside the main display. Otherwise, use 'Visible'."),
  isSuspicious: z.boolean().describe('Whether the window is deemed suspicious. Set to true for overlays, hidden windows with suspicious names, or anything that might be used for cheating.'),
});

const WindowAnalysisOutputSchema = z.array(WindowInfoSchema);

export type WindowAnalysisInput = z.infer<typeof WindowAnalysisInputSchema>;
export type WindowAnalysisOutput = z.infer<typeof WindowAnalysisOutputSchema>;


export async function analyzeWindows(input: WindowAnalysisInput): Promise<WindowAnalysisOutput> {
  return await windowAnalysisFlow(input);
}


const windowAnalysisPrompt = ai.definePrompt({
    name: 'windowAnalysisPrompt',
    input: { schema: WindowAnalysisInputSchema },
    output: { schema: WindowAnalysisOutputSchema },
    prompt: `You are a cybersecurity expert specializing in detecting cheating software and bypassing anti-detection mechanisms.
You will be given a list of open windows on a user's computer.
Analyze each window based on its name, class, and properties to identify potential threats. Cheating applications use several tricks to remain undetected:

- **Invisible Overlays**: Created with properties like 'WS_EX_LAYERED' and 'WS_EX_TRANSPARENT'. These are highly suspicious as they can draw over other applications without being seen directly.
- **Hidden Helpers**: Tool windows ('WS_EX_TOOLWINDOW') or windows with generic class names like 'WorkerW' can run in the background. Scrutinize their names; generic or randomized names are suspicious.
- **Content Protection**: Cheating apps may use 'WDA_CONTENTPROTECTION' (a property indicating the use of SetWindowDisplayAffinity) to prevent screen capture or inspection. A window with this property is extremely suspicious.
- **Borderless/Frameless Windows**: Look for windows that lack a standard frame ('WS_CAPTION') but are visible. Electron apps often use \`frame: false\` for this, which is a common characteristic of overlays.
- **Known Cheat Classes**: Classes like 'Electron.Overlay' are often used for cheat software.

For each window, determine its status ('Visible', 'Hidden', 'Off-Screen', 'Transparent') and set 'isSuspicious' to true or false. Provide the full list of windows with your analysis included, strictly adhering to the output schema.

Here is the list of windows to analyze:
{{{json input}}}
`,
});

const windowAnalysisFlow = ai.defineFlow(
    {
        name: 'windowAnalysisFlow',
        inputSchema: WindowAnalysisInputSchema,
        outputSchema: WindowAnalysisOutputSchema,
    },
    async (input) => {
        const { output } = await windowAnalysisPrompt(input);
        return output || [];
    }
);
