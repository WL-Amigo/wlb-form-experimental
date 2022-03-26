import { createFormContext } from '@wlb-form/react';
import { Validator } from '../../validator';

export type RPGItemType = 'healing' | 'attack';

export interface RPGItemEntryFormValues {
  name: string;
  description: string;
  type: RPGItemType;
  price: number;
  effectValue: number;
}

export interface RPGItemEditorFormValues {
  maxHealingValue: number;
  maxDamageValue: number;
  maxPriceValue: number;
  items: readonly RPGItemEntryFormValues[];
}

export const {
  FormStateProvider,
  useField,
  useChildrenChanged,
  useHasSomeErrors,
} = createFormContext<RPGItemEditorFormValues>(
  {
    maxHealingValue: 999,
    maxDamageValue: 9999,
    maxPriceValue: 999999,
    items: [
      {
        name: 'Potion',
        description: '',
        price: 150,
        type: 'healing',
        effectValue: 50,
      },
      {
        name: 'Mega Potion',
        description: '',
        price: 500,
        type: 'healing',
        effectValue: 150,
      },
      {
        name: 'Max Potion',
        description: '',
        price: 10000,
        type: 'healing',
        effectValue: 999,
      },
      {
        name: 'Barrel Bomb S',
        description: '',
        price: 300,
        type: 'attack',
        effectValue: 300,
      },
      {
        name: 'Barrel Bomb L',
        description: '',
        price: 3000,
        type: 'attack',
        effectValue: 1800,
      },
      {
        name: 'Barrel Bomp L+',
        description: '',
        price: 30000,
        type: 'attack',
        effectValue: 9999,
      },
    ],
  },
  ({ registerValidator }) => {
    // static
    registerValidator(
      [(values) => values.items[0].name],
      ([itemName]) =>
        Validator.required(itemName, 'Item name') ??
        Validator.lengthMinMax(itemName, 0, 20, 'Item name')
    );
    registerValidator(
      [(values) => values.items[0].description],
      ([description]) =>
        Validator.lengthMax(description, 60, 'Item description') ??
        Validator.linesMax(description, 3, 'Item description')
    );

    // dynamic
    registerValidator(
      [(values) => values.items[0].price, (values) => values.maxPriceValue],
      ([price, maxPriceValue]) =>
        Validator.numberMinMax(price, 0, maxPriceValue, 'Item price')
    );
    registerValidator(
      [
        (values) => values.items[0].type,
        (values) => values.items[0].effectValue,
        (values) => values.maxHealingValue,
        (values) => values.maxDamageValue,
      ],
      ([type, effectValue, maxHealingValue, maxDamageValue]) => {
        switch (type) {
          case 'healing':
            return Validator.numberMinMax(
              effectValue,
              0,
              maxHealingValue,
              'Item healing amount'
            );
          case 'attack':
            return Validator.numberMinMax(
              effectValue,
              0,
              maxDamageValue,
              'Item damage amount'
            );
        }
      }
    );
  }
);
