import { EntityJsonInterface } from '../interfaces/entity-json.interface';
import { BaseGenerator } from './base-generator';
import { CreateInterfaceGenerator } from './create-interface-generator';
import { UpdateInterfaceGenerator } from './update-interface-generator';
import { OrderInterfaceGenerator } from './order-interface-generator';
import { FilterInterfaceGenerator } from './filter-interface-generator';

export class InterfacesGenerator extends BaseGenerator {
  constructor(json: EntityJsonInterface) {
    super(json);
    this.data = json;
    this.suffix = 'interface';
    this.output = '';
    this.createInterface = new CreateInterfaceGenerator(this.data);
    this.updateInterface = new UpdateInterfaceGenerator(this.data);
    this.orderInterface = new OrderInterfaceGenerator(this.data);
    this.filterInterface = new FilterInterfaceGenerator(this.data);
  }

  private createInterface: CreateInterfaceGenerator;
  private updateInterface: UpdateInterfaceGenerator;
  private orderInterface: OrderInterfaceGenerator;
  private filterInterface: FilterInterfaceGenerator;

  public generateFiles() {
    this.updateInterface.generateFile();
    this.createInterface.generateFile();
    this.orderInterface.generateFile();
    this.filterInterface.generateFile();
  }
}
