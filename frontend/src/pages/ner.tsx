import {
  CheckCircleOutlined,
  ClearOutlined,
  LoadingOutlined,
  SendOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Input,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import React, { useState } from 'react';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface NerEntity {
  text: string;
  type: string;
  start: number;
  end: number;
  confidence: number;
}

const COLOR_POOL = [
  'blue',
  'green',
  'volcano',
  'purple',
  'cyan',
  'gold',
  'magenta',
  'geekblue',
  'orange',
];

const stringToHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 转为32位整数
  }
  return Math.abs(hash);
};

const EntityExtractionPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [highlightedContent, setHighlightedContent] =
    useState<React.ReactNode>(null);

  let dynamicColorMap = new Map<string, string>();

  const getColor = (entityType: string): string => {
    // 检查动态缓存
    if (dynamicColorMap.has(entityType)) {
      return dynamicColorMap.get(entityType)!;
    }

    // 新类型：使用哈希确定颜色
    const hash = stringToHash(entityType);
    const color = COLOR_POOL[hash % COLOR_POOL.length];

    // 缓存结果供后续使用
    dynamicColorMap.set(entityType, color);
    return color;
  };

  // 处理文本提交
  const handleSubmit = async () => {
    dynamicColorMap = new Map<string, string>();
    if (!inputText.trim()) {
      message.warning('请输入需要分析的文本内容');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setHighlightedContent(null);

    try {
      // 模拟实体抽取结果
      const entitiesRes = await extractEntities(inputText);
      setResults(entitiesRes);

      // 生成高亮文本
      generateHighlightedContent(inputText, entitiesRes);

      if (entitiesRes.length === 0) {
        message.info('未检测到有效实体');
      } else {
        message.success(`成功提取 ${entitiesRes.length} 个实体`);
      }
    } catch (err) {
      setError('实体抽取服务暂时不可用，请稍后重试');
      message.error('实体抽取失败');
    } finally {
      setLoading(false);
    }
  };

  // 生成高亮显示内容
  const generateHighlightedContent = (text: string, entities: any[]) => {
    if (!entities.length) {
      setHighlightedContent(text);
      return;
    }

    // 按起始位置排序实体
    const sortedEntities = [...entities].sort((a, b) => a.start - b.start);
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedEntities.forEach((entity, index) => {
      // 添加实体前的普通文本
      if (entity.start > lastIndex) {
        parts.push(text.substring(lastIndex, entity.start));
      }

      // 添加高亮实体
      const entityType = entity.type || 'UNKNOWN';
      const color = getColor(entityType);

      parts.push(
        <span
          key={`entity-${index}`}
          className={`px-1 rounded mx-0.5 font-medium border ${
            color !== 'default'
              ? `bg-${color}-50 border-${color}-200`
              : 'bg-gray-100 border-gray-200'
          }`}
          style={{
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            backgroundColor: color !== 'default' ? undefined : '#f0f0f0',
          }}
        >
          {text.substring(entity.start, entity.end)}
          <sup className="ml-1 text-xs opacity-70">
            <Tag color={color} className="m-0 px-1 py-0 h-auto text-[0.65em]">
              {entityType}
            </Tag>
          </sup>
        </span>,
      );

      lastIndex = entity.end;
    });

    // 添加剩余文本
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    setHighlightedContent(parts);
  };

  // 模拟实体抽取逻辑
  const extractEntities = (text: string): Promise<NerEntity[]> => {
    const data = {
      text: text,
    };

    return fetch('http://127.0.0.1:8001/api/ner', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: any[]): NerEntity[] => {
        return data.map((item) => ({
          text: item.text,
          type: item.type,
          start: item.start,
          end: item.end,
          confidence: item.confidence,
        }));
      });
  };

  // 清空输入
  const handleClear = () => {
    setInputText('');
    setResults([]);
    setHighlightedContent(null);
    setError(null);
    dynamicColorMap = new Map<string, string>();
  };

  // 表格列配置
  const columns = [
    {
      title: '实体内容',
      dataIndex: 'text',
      key: 'text',
      render: (text: string, record: any) => (
        <div className="font-medium text-gray-800 hover:text-blue-600 transition-colors">
          {text}
        </div>
      ),
    },
    {
      title: '实体类型',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type: string) => {
        const color = dynamicColorMap.get(type) || 'default';
        return (
          <Tag
            color={color}
            className="px-2 py-0.5 text-sm font-medium border"
            style={{
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              backgroundColor: color !== 'default' ? undefined : '#f0f0f0',
            }}
          >
            {type}
          </Tag>
        );
      },
    },
    {
      title: '位置',
      dataIndex: 'start',
      key: 'position',
      width: 100,
      render: (_: any, record: any) => (
        <span className="text-gray-600">
          {record.start}-{record.end}
        </span>
      ),
    },
    {
      title: '置信度',
      dataIndex: 'confidence',
      key: 'confidence',
      width: 200,
      render: (confidence: number) => (
        <div className="flex items-center">
          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
            <div
              className={`h-2 rounded-full ${
                confidence > 0.85
                  ? 'bg-green-500'
                  : confidence > 0.7
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${confidence * 100}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-700">
            {(confidence * 100).toFixed(1)}%
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-blue-100 rounded-2xl">
            <CheckCircleOutlined className="text-3xl text-blue-600" />
          </div>
          <Title level={2} className="mb-4 text-gray-800">
            金融命名实体识别
          </Title>
          <Text type="secondary" className="text-lg max-w-2xl mx-auto">
            输入文本内容，系统将自动识别并标注金融关键实体信息
          </Text>
        </div>

        <Card
          className="shadow-xl rounded-2xl overflow-hidden border-none"
          bodyStyle={{ padding: 0 }}
        >
          {/* 输入区域 */}
          <div className="p-6 border-b border-gray-100 bg-white rounded-t-2xl">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-medium text-gray-700">输入文本</label>
                  <span className="text-sm text-gray-500">
                    {inputText.length} 字符
                  </span>
                </div>
                <TextArea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="在此输入需要分析的文本内容..."
                  autoSize={{ minRows: 4, maxRows: 8 }}
                  className="rounded-xl text-base"
                  maxLength={5000}
                  showCount
                />
              </div>

              <div className="flex flex-col gap-3 w-full md:w-48 mt-8">
                <Button
                  type="primary"
                  icon={loading ? <LoadingOutlined /> : <SendOutlined />}
                  size="large"
                  className="h-12 rounded-xl font-medium text-lg flex items-center justify-center"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? '分析中...' : '开始分析'}
                </Button>
                <Button
                  icon={<ClearOutlined />}
                  size="large"
                  className="h-12 rounded-xl"
                  onClick={handleClear}
                  disabled={!inputText && results.length === 0}
                >
                  清空
                </Button>
              </div>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <Alert
              message="错误提示"
              description={error}
              type="error"
              showIcon
              className="m-6"
            />
          )}

          {/* 高亮显示区域 */}
          {highlightedContent !== null && (
            <div className="p-6 border-b border-gray-100 bg-white">
              <div className="flex justify-between items-center mb-4">
                <Title level={4} className="m-0 text-gray-800">
                  文本分析结果
                </Title>
                <Text type="secondary" className="text-gray-600">
                  共 {results.length} 个实体
                </Text>
              </div>
              <div
                className="p-5 bg-gray-50 rounded-xl min-h-[120px] leading-loose text-gray-800 border border-gray-200"
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: '1.75',
                }}
              >
                {highlightedContent}
              </div>
            </div>
          )}

          {/* 结果表格 */}
          {results.length > 0 && (
            <div className="p-6 bg-white rounded-b-2xl">
              <Title level={4} className="mb-4 text-gray-800">
                详细实体列表
              </Title>
              <Table
                dataSource={results}
                columns={columns}
                rowKey={(record, index) => `${record.start}-${index}`}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: ['5', '10', '20'],
                  showTotal: (total, range) =>
                    `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`,
                }}
                scroll={{ x: 'max-content' }}
                className="rounded-lg overflow-hidden"
                loading={loading}
              />
            </div>
          )}

          {/* 空状态 */}
          {!loading && highlightedContent === null && (
            <div className="p-12 text-center bg-white rounded-b-2xl">
              <div className="inline-block p-6 rounded-full bg-gray-100 mb-6">
                <SendOutlined className="text-4xl text-gray-400" />
              </div>
              <Title level={4} className="mb-2 text-gray-800">
                等待分析结果
              </Title>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EntityExtractionPage;
