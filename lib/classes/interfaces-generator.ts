import * as R from 'ramda';

import { EntityJsonInterface } from '../interfaces/entity-json.interface';
import { BaseGenerator } from './base-generator';
import { CreateInterfaceGenerator } from './create-interface-generator';
import { UpdateInterfaceGenerator } from './update-interface-generator';
import { OrderInterfaceGenerator } from './order-interface-generator';

export class InterfacesGenerator extends BaseGenerator {
  constructor(json: EntityJsonInterface) {
    super(json);
    this.data = json;
    this.suffix = 'interface';
    this.output = '';
    this.createInterface = new CreateInterfaceGenerator(this.data);
    this.updateInterface = new UpdateInterfaceGenerator(this.data);
    this.orderInerface = new OrderInterfaceGenerator(this.data);
  }

  private createInterface: CreateInterfaceGenerator;
  private updateInterface: UpdateInterfaceGenerator;
  private orderInerface: OrderInterfaceGenerator;

  public generateFiles() {
    this.updateInterface.generateFiles();
    this.createInterface.generateFiles();
    this.orderInerface.generateFiles();
  }
}
