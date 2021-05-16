import { EntityJsonInterface } from '../interfaces/entity-json.interface';
import { mkdirOfPath } from '../utils/directory.util';
import { FileGenerator } from './file-generator';
import { CreateInterfaceGenerator } from './create-interface-generator';
import { UpdateInterfaceGenerator } from './update-interface-generator';
import { OrderInterfaceGenerator } from './order-interface-generator';
import { FilterInterfaceGenerator } from './filter-interface-generator';

export class InterfacesGenerator extends FileGenerator {
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

  public async generateFiles() {
    this.createInterface.generateFile();
    this.updateInterface.generateFile();
    this.orderInterface.generateFile();
    this.filterInterface.generateFile();
  }
}
