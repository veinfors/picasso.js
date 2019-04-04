import { synthesize, syntheticUpdate } from '../synthesize';

describe('synthesize', () => {
  let settings,
    context,
    chartContext;
  beforeEach(() => {
    settings = {
      components: [
        {
          type: 'a',
          key: 'a',
          settings: {
            components: [{ type: 'b' }, { type: 'b' }]
          }
        },
        {
          type: 'c',
          settings: {
            components: [{ type: 'd' }, { type: 'd' }]
          }
        }
      ]
    };
    context = {
      registries: {
        component: () => ({}),
        data: () => () => ({})
      }
    };
    chartContext = {
      theme: {
        style: () => {}
      },
      isOnlyDataUpdate: () => false
    };
  });
  it('should build up preact components from definition', () => {
    const instance = synthesize({ settings }, context, chartContext);
    expect(instance.vdom.props.children.length).to.equal(2);
    expect(instance.vdom.props.children[0].props.children.length).to.equal(2);
    expect(instance.vdom.props.children[1].props.children.length).to.equal(2);
  });
  it('should update components from new definition', () => {
    const instance = synthesize({ settings }, context, chartContext);
    expect(instance.vdom.props.children.length).to.equal(2);
    expect(instance.vdom.props.children[0].props.children.length).to.equal(2);
    expect(instance.vdom.props.children[1].props.children.length).to.equal(2);
    const newSettings = {
      components: [
        {
          type: 'e',
          key: 'e',
          settings: {
            components: [{ type: 'f' }]
          }
        }
      ]
    };
    syntheticUpdate(instance, { settings: newSettings }, context, chartContext);
    expect(instance.vdom.props.children.length).to.equal(1);
    expect(instance.vdom.props.children[0].props.children.length).to.equal(1);
  });
});
