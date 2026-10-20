/**
 * Agents resource for the Lindo SDK
 *
 * Provides methods for running AI agents.
 *
 * @satisfies Requirements 5.2
 */

import type { HttpClient } from '../http';
import type { AgentRunRequest, AgentRunResponse } from '../types';

/**
 * Resource class for AI agent operations.
 */
export class AgentsResource {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Runs an AI agent with the specified input.
   *
   * @param request - The agent run request
   * @returns The agent run response
   *
   * @example
   * ```typescript
   * const response = await client.agents.run({
   *   agent_id: 'my-agent',
   *   input: { prompt: 'Hello, world!' }
   * });
   *
   * if (response.success) {
   *   console.log('Output:', response.output);
   * }
   * ```
   */
  async run(request: AgentRunRequest): Promise<AgentRunResponse> {
    return this.http.post<AgentRunResponse>('/v1/ai/agents/run', request);
  }

  /**
   * Runs an AI agent with streaming enabled.
   *
   * Note: This method returns a promise that resolves when the stream completes.
   * For real-time streaming, use the streaming API directly.
   *
   * @param request - The agent run request (stream will be set to true)
   * @returns The agent run response
   *
   * @example
   * ```typescript
   * const response = await client.agents.runStream({
   *   agent_id: 'my-agent',
   *   input: { prompt: 'Tell me a story' }
   * });
   * ```
   */
  async runStream(request: Omit<AgentRunRequest, 'stream'>): Promise<AgentRunResponse> {
    return this.http.post<AgentRunResponse>('/v1/ai/agents/run', {
      ...request,
      stream: true,
    });
  }
}
