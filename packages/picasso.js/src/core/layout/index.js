import registry from '../utils/registry';
import dockStrategy from './dock';
import gridStrategy from './grid';

const layoutRegistry = registry();
layoutRegistry('dock', dockStrategy);
layoutRegistry('grid', gridStrategy);

export default layoutRegistry;
