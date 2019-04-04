import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Icon } from 'semantic-ui-react';
import prompt from '../../core/prompt';
import confirm from '../../core/confirm';

const ExampleList = ({
  list, localList, activeItem, onItemSelect
}) => {
  const handleMenuItemClick = (e, { value }) => onItemSelect(value);

  const onAddItem = () => {
    prompt('What do you want to name it?', 'Awesomebox', (title) => {
      const result = localList.new({ title });
      if (result && result.id) {
        const newActiveItem = `@local/${result.id}`;
        onItemSelect(newActiveItem);
      }
    });
  };

  const onDeleteItem = () => {
    confirm('Are you sure you want to delete this item?', (result) => { // eslint-disable-line no-restricted-globals
      if (result) {
        localList.delete(activeItem.replace('@local/', ''));
      }
    });
    onItemSelect();
  };

  return (
    <Menu inverted pointing fluid vertical>
      <Menu.Item>
        <Menu.Header>
          <Icon name="chart bar" />
          Examples
        </Menu.Header>
      </Menu.Item>
      {list.map(item => (
        <Menu.Item
          value={item.id}
          key={item.id}
          active={activeItem === item.id}
          name={item.title}
          onClick={handleMenuItemClick}
        />
      ))}
      <Menu.Item>
        <Menu.Header>
          <Icon name="fork" />
          Local Forks
        </Menu.Header>
      </Menu.Item>
      {localList.list().map(item => (
        <Menu.Item
          value={`@local/${item.id}`}
          key={`@local/${item.id}`}
          name={item.title}
          active={activeItem === `@local/${item.id}`}
          onClick={handleMenuItemClick}
        />
      ))}
      <Menu.Item>
        <Menu.Item name="New" onClick={onAddItem}>
          <Icon name="add" />
          New
        </Menu.Item>
        <Menu.Item name="Delete" onClick={onDeleteItem}>
          <Icon name="trash" />
          Delete
        </Menu.Item>
      </Menu.Item>
    </Menu>
  );
};

ExampleList.propTypes = {
  list: PropTypes.arrayOf(PropTypes.shape(
    { id: PropTypes.string, title: PropTypes.string }
  )).isRequired,
  localList: PropTypes.shape({}).isRequired,
  activeItem: PropTypes.string.isRequired,
  onItemSelect: PropTypes.func.isRequired
};

export default ExampleList;
