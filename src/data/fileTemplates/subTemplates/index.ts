import { RootTemplateComponent } from 'types/templates';
import Modifier from './modifier.json';
import Choice from './choice.json';
import Effect from './effect.json';
import EffectScaling from './effectScaling.json';

const SubTemplates = {
    "modifier": Modifier as RootTemplateComponent,
    "choice": Choice as RootTemplateComponent,
    "effect": Effect as RootTemplateComponent,
    "effectScaling": EffectScaling as RootTemplateComponent
} satisfies Record<string, RootTemplateComponent>

export default SubTemplates;