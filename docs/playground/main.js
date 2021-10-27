import React from 'react';
import deepEqual from 'deep-equal';
import parseJson from 'json-parse-better-errors';
import AntdComp from 'form-render/lib/antd';
import FusionComp from 'form-render/lib/fusion';
import '@alifd/next/dist/next.min.css';
import DefaultSchema from './json/simplest.json';
import { Tabs } from 'antd';
import AsyncSelect from './customized/AsyncSelect';
import CodeBlock from './monaco';
const { TabPane } = Tabs;

// help functions
const schema2str = obj => JSON.stringify(obj, null, 2) || '';

class Demo extends React.Component {
  state = {
    schemaStr: schema2str(DefaultSchema),
    error: '',
  };

  componentDidUpdate(prevProps) {
    const { schemaName } = this.props;
    if (prevProps.schemaName !== schemaName) {
      const schema = require(`./json/${schemaName}.json`);
      this.setState({ schemaStr: schema2str(schema) });
    }
  }

  getSchemaString = () => {
    const { schemaName } = this.props;
    const schema = require(`./json/${schemaName}.json`);
    return schema2str(schema);
  };

  tryParse = schemaStr => {
    let schema = {};
    try {
      schema = parseJson(schemaStr);
      if (typeof schema !== 'object') {
        this.setState({ error: 'schema非正确json' });
        return;
      }
      this.setState({ error: '' });
      return schema;
    } catch (error) {
      this.setState({ error: String(error) });
    }
  };

  handleCodeChange = schemaStr => {
    this.setState({ schemaStr });
    this.tryParse(schemaStr);
  };

  handleDataChange = data => {
    const { schemaStr } = this.state;
    let schema = this.tryParse(schemaStr);
    if (schema && typeof data === 'object') {
      if (!deepEqual(schema.formData, data)) {
        schema = { ...schema, formData: data };
        this.setState({ schemaStr: schema2str(schema) });
      }
    }
  };

  handleValidate = valid => {
    console.log('没有通过的校验:', valid);
  };

  render() {
    const { theme, ...formProps } = this.props;
    const { schemaStr } = this.state;
    const FormRender = theme === 'antd' ? AntdComp : FusionComp;
    let schema = {};
    try {
      schema = parseJson(schemaStr);
    } catch (error) {
      console.log(error);
    }
    const { formData = {} } = schema;
    return (
      <div className="flex-auto flex">
        <div className="w-50 h-100 pl2 flex flex-column">
          <Tabs
            defaultActiveKey="1"
            onChange={() => {}}
            className="flex flex-column"
            style={{ overflow: 'auto' }}
          >
            <TabPane tab="Schema" key="1">
              <CodeBlock value={schemaStr} onChange={this.handleCodeChange} />
            </TabPane>
            <TabPane tab="Data" key="2">
              <CodeBlock value={schema2str(formData)} readOnly />
            </TabPane>
          </Tabs>
        </div>
        <div className="w-50 h-100 flex flex-column pa2">
          <div
            className="h-100 overflow-auto pa3 pt4 flex-auto"
            style={{ borderLeft: '1px solid #ddd' }}
          >
            {this.state.error ? (
              <div>{this.state.error}</div>
            ) : (
              <FormRender
                {...formProps}
                {...schema}
                formData={formData}
                onChange={this.handleDataChange}
                onValidate={this.handleValidate}
                widgets={{ asyncSelect: AsyncSelect }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Demo;
