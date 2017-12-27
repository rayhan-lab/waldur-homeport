import * as React from 'react';
import { InjectedFormProps } from 'redux-form';

import { StringField, TextField, SelectIconField, SelectAsyncField } from '@waldur/form-react';
import { TranslateProps } from '@waldur/i18n';
import { ActionDialog } from '@waldur/modal/ActionDialog';

import { JiraProject, JiraIssue, Resource } from './types';

interface IssueCreateDialogProps extends TranslateProps, InjectedFormProps {
  project: JiraProject;
  loadProjectIssues: (query: string) => Promise<JiraIssue[]>;
  loadProjectResources: (query: string) => Promise<Resource[]>;
  createIssue: any;
  showParentField: boolean;
}

const issueOptionRenderer = (option: JiraIssue) => (
  <span>{option.key || 'N/A'}: {option.summary}</span>
);

export const IssueCreateDialog = (props: IssueCreateDialogProps) => (
  <ActionDialog
    title={props.translate('Create request')}
    submitLabel={props.translate('Create request')}
    onSubmit={props.handleSubmit(props.createIssue)}
    submitting={props.submitting}
    error={props.error}>
    <SelectIconField
      name="type"
      label={props.translate('Request type')}
      options={props.project.issue_types}
      required={true}
      clearable={false}
      labelKey="name"
      valueKey="url"
      iconKey="icon_url"
    />
    {props.showParentField && (
      <SelectAsyncField
        name="parent"
        label={props.translate('Parent request')}
        required={true}
        labelKey="summary"
        valueKey="url"
        loadOptions={props.loadProjectIssues}
        optionRenderer={issueOptionRenderer}
        valueRenderer={issueOptionRenderer}
      />
    )}
    <StringField
      name="summary"
      label={props.translate('Summary')}
      required={true}
    />
    <TextField
      name="description"
      label={props.translate('Description')}
    />
    <SelectAsyncField
      name="resource"
      label={props.translate('Related resource')}
      labelKey="name"
      valueKey="url"
      loadOptions={props.loadProjectResources}
    />
  </ActionDialog>
);
