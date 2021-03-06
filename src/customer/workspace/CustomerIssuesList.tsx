import * as React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { IssuesList } from '@waldur/issues/list/IssuesList';
import { connectAngularComponent } from '@waldur/store/connect';
import { getCustomer } from '@waldur/workspace/selectors';

const mapStateToProps = createSelector(
  getCustomer,
  customer => ({
    scope: {customer},
    filter: {customer: customer && customer.url},
  }),
);

const CustomerIssuesListComponent = connect(mapStateToProps)(IssuesList);

const CustomerIssuesList = () => <CustomerIssuesListComponent hiddenColumns={['customer']}/>;

export default connectAngularComponent(CustomerIssuesList);
