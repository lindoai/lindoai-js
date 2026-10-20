/**
 * SDK Integration Tests
 *
 * Tests that SDK resource methods call the correct HTTP endpoints.
 * Uses mocked HTTP client to verify endpoint paths and HTTP methods.
 *
 * **Validates: Requirements 25.1, 25.2, 25.3, 25.4, 25.5**
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PagesResource } from '../resources/pages';
import { BlogsResource } from '../resources/blogs';
import { WebsitesResource } from '../resources/websites';
import { WorkspaceResource } from '../resources/workspace';
import type { HttpClient } from '../http';

/**
 * Creates a mock HTTP client that tracks all method calls.
 */
function createMockHttpClient() {
  return {
    get: vi.fn().mockResolvedValue({ success: true, result: {} }),
    post: vi.fn().mockResolvedValue({ success: true, result: {} }),
    put: vi.fn().mockResolvedValue({ success: true, result: {} }),
    delete: vi.fn().mockResolvedValue({ success: true, result: {} }),
  } as unknown as HttpClient;
}

// ============================================================================
// PagesResource Tests - Validates: Requirement 25.1
// ============================================================================

describe('PagesResource', () => {
  let mockHttp: ReturnType<typeof createMockHttpClient>;
  let pages: PagesResource;

  beforeEach(() => {
    mockHttp = createMockHttpClient();
    pages = new PagesResource(mockHttp);
  });

  describe('list', () => {
    it('should call GET /v1/workspace/website/{website_id}/pages/list', async () => {
      const websiteId = 'website-123';

      await pages.list(websiteId);

      expect(mockHttp.get).toHaveBeenCalledWith(
        `/v1/workspace/website/${websiteId}/pages/list`,
        { params: {} }
      );
    });

    it('should include page parameter when provided', async () => {
      const websiteId = 'website-123';

      await pages.list(websiteId, { page: 2 });

      expect(mockHttp.get).toHaveBeenCalledWith(
        `/v1/workspace/website/${websiteId}/pages/list`,
        { params: { page: 2 } }
      );
    });

    it('should include search parameter when provided', async () => {
      const websiteId = 'website-123';

      await pages.list(websiteId, { search: 'about' });

      expect(mockHttp.get).toHaveBeenCalledWith(
        `/v1/workspace/website/${websiteId}/pages/list`,
        { params: { search: 'about' } }
      );
    });

    it('should include both page and search parameters when provided', async () => {
      const websiteId = 'website-123';

      await pages.list(websiteId, { page: 3, search: 'contact' });

      expect(mockHttp.get).toHaveBeenCalledWith(
        `/v1/workspace/website/${websiteId}/pages/list`,
        { params: { page: 3, search: 'contact' } }
      );
    });
  });

  describe('get', () => {
    it('should call GET /v1/workspace/website/{website_id}/page/{page_id}', async () => {
      const websiteId = 'website-123';
      const pageId = 'page-456';

      await pages.get(websiteId, pageId);

      expect(mockHttp.get).toHaveBeenCalledWith(
        `/v1/workspace/website/${websiteId}/page/${pageId}`
      );
    });
  });

  describe('publish', () => {
    it('should call POST /v1/workspace/website/{website_id}/page/{page_id}/publish', async () => {
      const websiteId = 'website-123';
      const pageId = 'page-456';

      await pages.publish(websiteId, pageId);

      expect(mockHttp.post).toHaveBeenCalledWith(
        `/v1/workspace/website/${websiteId}/page/${pageId}/publish`
      );
    });
  });

  describe('unpublish', () => {
    it('should call POST /v1/workspace/website/{website_id}/page/{page_id}/unpublish', async () => {
      const websiteId = 'website-123';
      const pageId = 'page-456';

      await pages.unpublish(websiteId, pageId);

      expect(mockHttp.post).toHaveBeenCalledWith(
        `/v1/workspace/website/${websiteId}/page/${pageId}/unpublish`
      );
    });
  });
});

// ============================================================================
// BlogsResource Tests - Validates: Requirement 25.2
// ============================================================================

describe('BlogsResource', () => {
  let mockHttp: ReturnType<typeof createMockHttpClient>;
  let blogs: BlogsResource;

  beforeEach(() => {
    mockHttp = createMockHttpClient();
    blogs = new BlogsResource(mockHttp);
  });

  describe('list', () => {
    it('should call GET /v1/workspace/website/{website_id}/blogs/list', async () => {
      const websiteId = 'website-123';

      await blogs.list(websiteId);

      expect(mockHttp.get).toHaveBeenCalledWith(
        `/v1/workspace/website/${websiteId}/blogs/list`,
        { params: {} }
      );
    });

    it('should include page parameter when provided', async () => {
      const websiteId = 'website-123';

      await blogs.list(websiteId, { page: 2 });

      expect(mockHttp.get).toHaveBeenCalledWith(
        `/v1/workspace/website/${websiteId}/blogs/list`,
        { params: { page: 2 } }
      );
    });

    it('should include search parameter when provided', async () => {
      const websiteId = 'website-123';

      await blogs.list(websiteId, { search: 'tutorial' });

      expect(mockHttp.get).toHaveBeenCalledWith(
        `/v1/workspace/website/${websiteId}/blogs/list`,
        { params: { search: 'tutorial' } }
      );
    });

    it('should include both page and search parameters when provided', async () => {
      const websiteId = 'website-123';

      await blogs.list(websiteId, { page: 3, search: 'news' });

      expect(mockHttp.get).toHaveBeenCalledWith(
        `/v1/workspace/website/${websiteId}/blogs/list`,
        { params: { page: 3, search: 'news' } }
      );
    });
  });

  describe('get', () => {
    it('should call GET /v1/workspace/website/{website_id}/blog/{blog_id}', async () => {
      const websiteId = 'website-123';
      const blogId = 'blog-456';

      await blogs.get(websiteId, blogId);

      expect(mockHttp.get).toHaveBeenCalledWith(
        `/v1/workspace/website/${websiteId}/blog/${blogId}`
      );
    });
  });

  describe('publish', () => {
    it('should call POST /v1/workspace/website/{website_id}/blog/{blog_id}/publish', async () => {
      const websiteId = 'website-123';
      const blogId = 'blog-456';

      await blogs.publish(websiteId, blogId);

      expect(mockHttp.post).toHaveBeenCalledWith(
        `/v1/workspace/website/${websiteId}/blog/${blogId}/publish`
      );
    });
  });

  describe('unpublish', () => {
    it('should call POST /v1/workspace/website/{website_id}/blog/{blog_id}/unpublish', async () => {
      const websiteId = 'website-123';
      const blogId = 'blog-456';

      await blogs.unpublish(websiteId, blogId);

      expect(mockHttp.post).toHaveBeenCalledWith(
        `/v1/workspace/website/${websiteId}/blog/${blogId}/unpublish`
      );
    });
  });
});

// ============================================================================
// WebsitesResource Extended Methods Tests - Validates: Requirement 25.3
// ============================================================================

describe('WebsitesResource (Extended Methods)', () => {
  let mockHttp: ReturnType<typeof createMockHttpClient>;
  let websites: WebsitesResource;

  beforeEach(() => {
    mockHttp = createMockHttpClient();
    websites = new WebsitesResource(mockHttp);
  });

  describe('getDetails', () => {
    it('should call GET /v1/workspace/website/{website_id}', async () => {
      const websiteId = 'website-123';

      await websites.getDetails(websiteId);

      expect(mockHttp.get).toHaveBeenCalledWith(
        `/v1/workspace/website/${websiteId}`
      );
    });
  });

  describe('updateSettings', () => {
    it('should call PUT /v1/workspace/website/{website_id}/settings with settings body', async () => {
      const websiteId = 'website-123';
      const settings = {
        business_name: 'My Business',
        language: 'en',
      };

      await websites.updateSettings(websiteId, settings);

      expect(mockHttp.put).toHaveBeenCalledWith(
        `/v1/workspace/website/${websiteId}/settings`,
        settings
      );
    });

    it('should include all optional settings fields', async () => {
      const websiteId = 'website-123';
      const settings = {
        business_name: 'My Business',
        business_description: 'A great business',
        language: 'en',
        theme: { primary_color: '#007bff' },
        robots: 'User-agent: *\nAllow: /',
        custom_code_header: '<script>console.log("header")</script>',
        custom_code_footer: '<script>console.log("footer")</script>',
        socials: { twitter: 'https://twitter.com/mybusiness' },
        fonts: { heading: 'Arial', body: 'Helvetica' },
      };

      await websites.updateSettings(websiteId, settings);

      expect(mockHttp.put).toHaveBeenCalledWith(
        `/v1/workspace/website/${websiteId}/settings`,
        settings
      );
    });
  });

  describe('addDomain', () => {
    it('should call POST /v1/workspace/website/{website_id}/domain with domain body', async () => {
      const websiteId = 'website-123';
      const domain = 'example.com';

      await websites.addDomain(websiteId, domain);

      expect(mockHttp.post).toHaveBeenCalledWith(
        `/v1/workspace/website/${websiteId}/domain`,
        { domain }
      );
    });
  });

  describe('removeDomain', () => {
    it('should call DELETE /v1/workspace/website/{website_id}/domain', async () => {
      const websiteId = 'website-123';

      await websites.removeDomain(websiteId);

      expect(mockHttp.delete).toHaveBeenCalledWith(
        `/v1/workspace/website/${websiteId}/domain`
      );
    });
  });

  describe('addIntegration', () => {
    it('should call POST /v1/workspace/website/{website_id}/integration with integration body', async () => {
      const websiteId = 'website-123';
      const integration = {
        integration_type: 'matomo' as const,
        config: {
          site_id: '12345',
          url: 'https://analytics.example.com',
        },
      };

      await websites.addIntegration(websiteId, integration);

      expect(mockHttp.post).toHaveBeenCalledWith(
        `/v1/workspace/website/${websiteId}/integration`,
        integration
      );
    });
  });

  describe('removeIntegration', () => {
    it('should call DELETE /v1/workspace/website/{website_id}/integration/{integration_type}', async () => {
      const websiteId = 'website-123';
      const integrationType = 'matomo';

      await websites.removeIntegration(websiteId, integrationType);

      expect(mockHttp.delete).toHaveBeenCalledWith(
        `/v1/workspace/website/${websiteId}/integration/${integrationType}`
      );
    });
  });

  describe('addTeamMember', () => {
    it('should call POST /v1/workspace/website/{website_id}/team with email and role', async () => {
      const websiteId = 'website-123';
      const email = 'user@example.com';
      const role = 'Editor' as const;

      await websites.addTeamMember(websiteId, email, role);

      expect(mockHttp.post).toHaveBeenCalledWith(
        `/v1/workspace/website/${websiteId}/team`,
        { email, role }
      );
    });

    it('should support Commenter role', async () => {
      const websiteId = 'website-123';
      const email = 'commenter@example.com';
      const role = 'Commenter' as const;

      await websites.addTeamMember(websiteId, email, role);

      expect(mockHttp.post).toHaveBeenCalledWith(
        `/v1/workspace/website/${websiteId}/team`,
        { email, role }
      );
    });
  });

  describe('removeTeamMember', () => {
    it('should call DELETE /v1/workspace/website/{website_id}/team/{member_id}', async () => {
      const websiteId = 'website-123';
      const memberId = 'member-456';

      await websites.removeTeamMember(websiteId, memberId);

      expect(mockHttp.delete).toHaveBeenCalledWith(
        `/v1/workspace/website/${websiteId}/team/${memberId}`
      );
    });
  });
});

// ============================================================================
// WorkspaceResource Extended Methods Tests - Validates: Requirement 25.4
// ============================================================================

describe('WorkspaceResource (Extended Methods)', () => {
  let mockHttp: ReturnType<typeof createMockHttpClient>;
  let workspace: WorkspaceResource;

  beforeEach(() => {
    mockHttp = createMockHttpClient();
    workspace = new WorkspaceResource(mockHttp);
  });

  describe('get', () => {
    it('should call GET /v1/workspace', async () => {
      await workspace.get();

      expect(mockHttp.get).toHaveBeenCalledWith('/v1/workspace');
    });
  });

  describe('update', () => {
    it('should call PUT /v1/workspace with update fields', async () => {
      const fields = {
        workspace_name: 'My Workspace',
        workspace_language: 'en',
        webhook_url: 'https://example.com/webhook',
      };

      await workspace.update(fields);

      expect(mockHttp.put).toHaveBeenCalledWith('/v1/workspace', fields);
    });

    it('should support partial updates', async () => {
      const fields = {
        workspace_name: 'Updated Name',
      };

      await workspace.update(fields);

      expect(mockHttp.put).toHaveBeenCalledWith('/v1/workspace', fields);
    });
  });

  describe('addTeamMember', () => {
    it('should call POST /v1/workspace/team with email and role', async () => {
      const email = 'user@example.com';
      const role = 'Team' as const;

      await workspace.addTeamMember(email, role);

      expect(mockHttp.post).toHaveBeenCalledWith('/v1/workspace/team', {
        email,
        role,
      });
    });
  });

  describe('removeTeamMember', () => {
    it('should call DELETE /v1/workspace/team/{member_id}', async () => {
      const memberId = 'member-456';

      await workspace.removeTeamMember(memberId);

      expect(mockHttp.delete).toHaveBeenCalledWith(
        `/v1/workspace/team/${memberId}`
      );
    });
  });

  describe('addIntegration', () => {
    it('should call POST /v1/workspace/integration with integration body', async () => {
      const integration = {
        integration_type: 'matomo' as const,
        config: {
          site_id: '12345',
          url: 'https://analytics.example.com',
        },
      };

      await workspace.addIntegration(integration);

      expect(mockHttp.post).toHaveBeenCalledWith(
        '/v1/workspace/integration',
        integration
      );
    });
  });

  describe('removeIntegration', () => {
    it('should call DELETE /v1/workspace/integration/{integration_type}', async () => {
      const integrationType = 'matomo';

      await workspace.removeIntegration(integrationType);

      expect(mockHttp.delete).toHaveBeenCalledWith(
        `/v1/workspace/integration/${integrationType}`
      );
    });
  });

  describe('setupWhitelabel', () => {
    it('should call PUT /v1/workspace/whitelabel with config', async () => {
      const config = {
        domain: 'app.example.com',
        subdomain_domain: 'clients.example.com',
        email_sender: 'noreply@example.com',
        wl_client_register: true,
      };

      await workspace.setupWhitelabel(config);

      expect(mockHttp.put).toHaveBeenCalledWith(
        '/v1/workspace/whitelabel',
        config
      );
    });

    it('should support partial whitelabel config', async () => {
      const config = {
        domain: 'app.example.com',
      };

      await workspace.setupWhitelabel(config);

      expect(mockHttp.put).toHaveBeenCalledWith(
        '/v1/workspace/whitelabel',
        config
      );
    });
  });

  describe('updateAppearance', () => {
    it('should call PUT /v1/workspace/appearance with config', async () => {
      const config = {
        primary_color: '#007bff',
        secondary_color: '#6c757d',
        theme_mode: 'light',
        custom_code_header: '<script>console.log("header")</script>',
        custom_code_footer: '<script>console.log("footer")</script>',
      };

      await workspace.updateAppearance(config);

      expect(mockHttp.put).toHaveBeenCalledWith(
        '/v1/workspace/appearance',
        config
      );
    });

    it('should support partial appearance config', async () => {
      const config = {
        primary_color: '#ff0000',
      };

      await workspace.updateAppearance(config);

      expect(mockHttp.put).toHaveBeenCalledWith(
        '/v1/workspace/appearance',
        config
      );
    });
  });
});

// ============================================================================
// SDK Type Exports Tests - Validates: Requirement 25.5
// ============================================================================

describe('SDK Type Exports', () => {
  it('should export PagesResource', async () => {
    const { PagesResource } = await import('../resources');
    expect(PagesResource).toBeDefined();
  });

  it('should export BlogsResource', async () => {
    const { BlogsResource } = await import('../resources');
    expect(BlogsResource).toBeDefined();
  });

  it('should export WebsitesResource', async () => {
    const { WebsitesResource } = await import('../resources');
    expect(WebsitesResource).toBeDefined();
  });

  it('should export WorkspaceResource', async () => {
    const { WorkspaceResource } = await import('../resources');
    expect(WorkspaceResource).toBeDefined();
  });
});
