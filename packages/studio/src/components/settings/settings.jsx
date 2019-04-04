import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown, Grid } from 'semantic-ui-react';

import './settings.css';

function ButtonGroup({ subProperty }) {
  const [activeButton, setActiveButton] = useState(subProperty.default);
  const onClick = (e) => {
    setActiveButton(e.target.value);
    subProperty.change(e, { value: e.target.value });
  };
  return (
    <Button.Group
      onClick={onClick}
      buttons={subProperty.options.map(o => ({
        active: o.value === activeButton,
        key: o.value,
        value: o.value,
        content: o.name
      }))}
    />
  );
}

ButtonGroup.propTypes = {
  subProperty: PropTypes.shape({}).isRequired
};

function Settings(props) {
  const { settings } = props;

  const generateSettingsComponents = () => {
    const generated = [];
    settings.forEach((property) => {
      const titleRow = (
        <Grid.Row key={`${property.id}0`}>
          {property.subProperties.map(subProperty => (
            <Grid.Column key={subProperty.id}>{subProperty.title}</Grid.Column>
          ))}
        </Grid.Row>
      );
      const propRow = (
        <Grid.Row key={`${property.id}1`}>
          {property.subProperties.map((subProperty) => {
            switch (subProperty.type) {
              case 'radio':
                return (
                  <Grid.Column key={subProperty.id}>
                    <ButtonGroup subProperty={subProperty} />
                  </Grid.Column>
                );
              case 'dropdown':
                return (
                  <Grid.Column key={subProperty.id}>
                    <Dropdown
                      defaultValue={subProperty.default}
                      selection
                      options={subProperty.options.map((o, ix) => ({ key: o, text: o, value: ix }))}
                      onChange={subProperty.change}
                    />
                  </Grid.Column>
                );
              default:
                throw new Error(`unknown property type: ${property.type}`);
            }
          })}
        </Grid.Row>
      );
      generated.push(titleRow);
      generated.push(propRow);
    });
    // generated.push((
    //   <Grid.Row key="title">
    //     <Grid.Column>
    //       <Segment>Setting 1</Segment>
    //     </Grid.Column>
    //     <Grid.Column>
    //       <Segment>Setting 2</Segment>
    //     </Grid.Column>
    //   </Grid.Row>
    // ));
    return generated;
  };

  return (
    <div className="settings">
      <Grid columns="equal">
        <Grid.Row><h3>Picasso Settings</h3></Grid.Row>
        {generateSettingsComponents()}
      </Grid>
    </div>
  );
}

Settings.propTypes = {
  settings: PropTypes.arrayOf(PropTypes.shape({})).isRequired
};

export default Settings;
