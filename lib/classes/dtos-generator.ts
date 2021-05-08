import { EntityJsonInterface } from '../interfaces/entity-json.interface';
import { mkdirOfPath } from '../utils/directory.util';
import { FileGenerator } from './file-generator';
import { PagingDTOGenerator } from './paging-dto-generator';

export class DTOsGenerator extends FileGenerator {
  constructor(json: EntityJsonInterface) {
    super(json);
    this.data = json;
    this.suffix = 'dto';
    this.output = '';
    this.pagingDTO = new PagingDTOGenerator(this.data);
  }

  private pagingDTO: PagingDTOGenerator;

  public async generateFiles() {
    this.pagingDTO.generateFile();
  }
}
