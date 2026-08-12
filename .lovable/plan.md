# Plan: Professional Project Management Dashboard

Enhance the multi-project (SaaS) architecture by transforming the workspace selection and project dashboard environments into professional, high-density interfaces similar to the master admin panel.

## User Interface

- **Workspace Selection (`/app`)**: Add a "Create Project" wizard/modal.
- **Project Dashboard (`/produtor`)**: Rebuild as a high-density panel with a collapsible sidebar and specialized tabs:
  - **Dashboard**: Integrated sales and operational metrics.
  - **Marketing**: Ad management and push notification controls.
  - **Check-in**: Real-time access control monitoring.
  - **Team**: Granular user management for that specific project.
- **Navigation**: Integrated project switcher and "Home" (Workspace) button.

## Technical Details

- **Routing**: Utilize `/produtor` as the layout route for all project-specific management.
- **Components**:
  - `ProjectDashboardLayout`: New layout with collapsible sidebar.
  - `ProjectMarketingPanel`: Unified marketing interface.
  - `ProjectTeamPanel`: Member management scoped to `tenant_id`.
- **Database**:
  - Leverage existing `tenants` and `tenant_members` tables.
  - Ensure all queries are strictly filtered by the `activeTenant.id`.
- **Security**: Maintain RLS isolation between projects.

## User Review Required

- Confirm if the "Marketing" tab should prioritize push notifications or paid ads management.
- Verify if the "Check-in" dashboard should be read-only or allow operational actions (like manual check-in).
