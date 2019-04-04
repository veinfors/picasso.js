import create from '../create';

describe('Create component', () => {
  let sandbox;
  let component;
  let data;
  let interactions;
  let context;
  let instance;
  let chart;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    component = sandbox.stub().returns({});
    data = sandbox.stub();
    interactions = sandbox.stub();
    context = { registries: { component, data, interactions } };
    chart = { theme: { style: () => {} } };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should create default instance', () => {
    instance = create({}, context, chart);
    // make a snapshot of default, update as we continue to add functionality
    expect(instance).toMatchSnapshot();
  });

  it('should add child', () => {
    instance = create({}, context, chart);
    const child = {};
    instance.addChild(child);
    expect(instance.getChildren().pop()).to.equal(child);
  });

  it('should get children', () => {
    instance = create({}, context, chart);
    const c1 = {};
    const c2 = {};
    const c3 = {};
    [c1, c2, c3].map(c => instance.addChild(c));
    expect(instance.getChildren()).to.have.length(3);
  });
});
