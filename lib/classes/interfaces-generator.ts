import * as R from 'ramda';

import { EntityJsonInterface } from '../interfaces/entity-json.interface';
import { BaseGenerator } from './base-generator';
import { CreateInterfaceGenerator } from './create-interface-generator';
import { UpdateInterfaceGenerator } from './update-interface-generator';

export class InterfacesGenerator extends BaseGenerator {
  constructor(json: EntityJsonInterface) {
    super(json);
    this.data = json;
    this.suffix = 'interface';
    this.output = '';
    this.createInterface = new CreateInterfaceGenerator(this.data);
    this.updateInterface = new UpdateInterfaceGenerator(this.data);
  }

  private createInterface: CreateInterfaceGenerator;
  private updateInterface: UpdateInterfaceGenerator;

  public generateFiles() {
    this.updateInterface.generateFiles();
    this.createInterface.generateFiles();
  }
}
