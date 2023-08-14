import { RootTemplateComponent } from 'types/templates';
import Modifier from './modifier.json';
import Choice from './choice.json';

const SubTemplates = {
    "modifier": Modifier as RootTemplateComponent,
    "choice": Choice as RootTemplateComponent
} satisfies Record<string, RootTemplateComponent>

export default SubTemplates;