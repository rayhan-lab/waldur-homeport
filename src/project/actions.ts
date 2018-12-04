import { createFormAction } from 'redux-form-saga';

import { Project } from '@waldur/workspace/types';

export const createProject = createFormAction('waldur/project/CREATE');
export const updateProject = createFormAction('waldur/project/UPDATE');
export const gotoProjectList = createFormAction('waldur/project/GOTO_LIST');

export const GOTO_PROJECT_CREATE = 'waldur/project/GOTO_CREATE';
export const DELETE_PROJECT = 'waldur/project/DELETE';

export const gotoProjectCreate = () => ({
  type: GOTO_PROJECT_CREATE,
});

export const deleteProject = (project: Project) => ({
  type: DELETE_PROJECT,
  payload: {project},
});
