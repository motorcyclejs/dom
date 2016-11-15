import { Stream, empty } from 'most';
import { findIndex } from '@most/prelude';
import { DomSource, VNode } from '../interfaces';

export function mockDomSource(config: MockConfig): DomSource {
  return new MockDomSource(config);
}

export interface MockConfig {
  [key: string]: (MockConfig | Stream<any>);
}

const SCOPE_PREFIX = '___';

class MockDomSource implements DomSource {
  private config: MockConfig;

  constructor(config: MockConfig) {
    this.config = config;
  }

  public elements(): Stream<any> {
    return (this.config as any).elements || empty();
  }

  public events(eventType: string): Stream<any> {
    const config: MockConfig = this.config;

    const keys: Array<string> = Object.keys(config);
    const index: number = findIndex(eventType, keys);

    return config[keys[index]] as Stream<any> || empty();
  }

  public select(selector: string): MockDomSource {
    const config: MockConfig = this.config;

    const keys: Array<string> = Object.keys(config);
    const index: number = findIndex(selector, keys);

    return new MockDomSource(index === -1 ? {} : config[keys[index]] as MockConfig);
  }

  public isolateSource(source: MockDomSource, scope: string): MockDomSource {
    return source.select(`.${SCOPE_PREFIX}${scope}`);
  }

  public isolateSink(sink: Stream<VNode<any>>, scope: string): Stream<VNode<any>> {
    return sink.map(function isolateVNodeSink(vNode: VNode<any>) {
      if (vNode.selector.indexOf(SCOPE_PREFIX + scope) !== -1) {
        vNode.selector += `.${SCOPE_PREFIX}${scope}`;
      }

      return vNode;
    });
  }
}