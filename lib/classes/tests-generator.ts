import { EntityJsonInterface } from '../interfaces/entity-json.interface';
import { FileGenerator } from './file-generator';
import { MocksGenerator } from './mock-data-generator';
import { ServiceSpecGenerator } from './service-spec-generator';
import { ResolverSpecGenerator } from './resolver-spec-generator';

export class TestsGenerator extends FileGenerator {
  constructor(json: EntityJsonInterface) {
    super(json);
    this.data = json;
    this.suffix = 'spec';
    this.output = '';
    this.mocks = new MocksGenerator(this.data);
    this.serviceSpec = new ServiceSpecGenerator(this.data);
    this.resolverSpec = new ResolverSpecGenerator(this.data);
  }

  private mocks: MocksGenerator;
  private serviceSpec: ServiceSpecGenerator;
  private resolverSpec: ResolverSpecGenerator;

  public generateFiles() {
    this.mocks.generateFile();
    this.serviceSpec.generateFile();
    this.resolverSpec.generateFile();
  }
}
