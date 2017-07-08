export default [
  {
    name: gettext('General'),
    title: gettext('General information'),
    icon: 'fa-sitemap',
    fields: [
      {
        name: 'name',
        type: 'string',
        required: true,
        label: gettext('Name'),
        maxlength: 150,
      },
      {
        name: 'email',
        type: 'email',
        label: gettext('Contact e-mail'),
        required: true,
      },
      {
        name: 'phone_number',
        type: 'tel',
        label: gettext('Contact phone'),
      },
    ]
  },
  {
    name: gettext('Accounting'),
    title: gettext('Accounting details'),
    icon: 'fa-sitemap',
    fields: [
      {
        name: 'registration_code',
        type: 'string',
        label: gettext('Organization registration code'),
        maxlength: 150,
        required: true,
      },
      {
        name: 'country',
        label: gettext('Country'),
        component: 'customer-country-field',
        placeholder: gettext('Select country...'),
      },
      {
        name: 'contact_details',
        label: gettext('Address'),
        type: 'string',
        required: true,
      },
      {
        name: 'vat_code',
        label: gettext('EU VAT ID'),
        type: 'string',
        help_text: gettext('Please provide your EU VAT ID if you are registered in the European Union.')
      },
    ]
  },
  {
    name: gettext('Policies'),
    title: gettext('Setup policies'),
    icon: 'fa-sitemap',
    fields: [
      {
        name: 'threshold',
        component: 'customer-threshold-field',
      },
    ]
  },
  {
    name: gettext('Expert provider'),
    title: gettext('Setup expert provider'),
    icon: 'fa-sitemap',
    feature: 'experts',
    fields: [
      {
        name: 'agree_with_policy',
        type: 'tos',
        sref: 'tos.experts',
        required: false,
      },
    ]
  }
];