import { FunctionComponent, SVGAttributes }from 'react'
import { ParseError } from 'utils/parser';
import Icons from 'assets/icons';
import { Queries, IElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements.module.scss';

interface IconOptions extends Variables {
    icon?: string
    tooltips?: string
}

class Options implements IconOptions {
    protected readonly options: IconOptions;

    constructor(options: IconOptions) {
        this.options =  options ?? {}
    }

    public get icon(): string {
        return this.options.icon ?? null
    }

    public get iconElement(): FunctionComponent<SVGAttributes<SVGElement>> {
        return Icons[this.icon] ?? (() => null)
    }

    public get tooltips(): string {
        return this.options.tooltips ?? undefined
    }
}

const validOptions = new Set(['icon', 'tooltips']);
const validateOptions = (options: IconOptions): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected icon option: '${key}'`);
    });
    return {}
}

const IconElement = ({ options = {} }: ElementParams<IconOptions>): JSX.Element => {
    const iconOptions = new Options(options)
    return (
        <span tooltips={iconOptions.tooltips} className={styles.icon}> 
            <iconOptions.iconElement/> 
        </span>
    )
}

export const element = {
    icon: {
        type: 'icon',
        defaultKey: 'icon',
        buildChildren: false,
        validOptions: validOptions,
        toComponent: IconElement,
        validate: validateOptions
    }
} satisfies Record<string, IElementObject>

export default IconElement;