'use server';
/**
 * @fileOverview An AI flow for analyzing running processes for potential threats.
 *
 * - analyzeProcesses - A function that takes a list of processes and returns an analysis.
 * - ProcessAnalysisInput - The input type for the analyzeProcesses function.
 * - ProcessAnalysisOutput - The return type for the analyzeProcesses function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ProcessSchema = z.object({
  pid: z.number().describe('The process ID.'),
  name: z.string().describe('The name of the process executable.'),
  path: z.string().describe('The full file path of the executable.'),
  risk: z.enum(['Low', 'Medium', 'High']).describe("The assessed risk level. Use 'High' for known cheating tools, malware, or highly suspicious behavior (e.g., unsigned executables in temp folders). Use 'Medium' for potentially unwanted programs, unsigned software in user directories, or processes with suspicious names. Use 'Low' for signed, known-good software from reputable vendors."),
  details: z.string().describe('A brief explanation for the risk assessment. Mention if it is a known application, if it is signed, or why it is suspicious.'),
});

const ProcessAnalysisInputSchema = z.array(
    z.object({
        pid: z.number(),
        name: z.string(),
        path: z.string(),
    })
);

const ProcessAnalysisOutputSchema = z.array(ProcessSchema);

export type ProcessAnalysisInput = z.infer<typeof ProcessAnalysisInputSchema>;
export type ProcessAnalysisOutput = z.infer<typeof ProcessAnalysisOutputSchema>;


export async function analyzeProcesses(input: ProcessAnalysisInput): Promise<ProcessAnalysisOutput> {
  return await processAnalysisFlow(input);
}


const processAnalysisPrompt = ai.definePrompt({
    name: 'processAnalysisPrompt',
    input: { schema: ProcessAnalysisInputSchema },
    output: { schema: ProcessAnalysisOutputSchema },
    prompt: `You are a cybersecurity expert specializing in detecting cheating software and malware on a user's computer.
You will be given a list of running processes.
Analyze each process based on its name and file path.
Identify any processes that are known cheating applications, malware, or exhibit suspicious characteristics (e.g., running from unusual locations like temporary folders, having suspicious names, being unsigned).
For each process, provide a risk assessment ('Low', 'Medium', or 'High') and a brief justification for your assessment.
Well-known applications from reputable vendors (e.g., Google, Microsoft, Adobe) should be considered 'Low' risk unless their path is highly unusual.
Return the full list of processes with your analysis included, adhering to the required output schema.

Here is the list of processes to analyze:
{{{json input}}}
`,
});

const processAnalysisFlow = ai.defineFlow(
    {
        name: 'processAnalysisFlow',
        inputSchema: ProcessAnalysisInputSchema,
        outputSchema: ProcessAnalysisOutputSchema,
    },
    async (input) => {
        const { output } = await processAnalysisPrompt(input);
        return output || [];
    }
);
