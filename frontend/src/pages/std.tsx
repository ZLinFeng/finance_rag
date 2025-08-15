import {
  BookOutlined,
  CheckCircleOutlined,
  ClearOutlined,
  LoadingOutlined,
  SendOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Badge,
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

// 术语领域颜色映射
const TERM_DOMAIN_COLORS: Record<string, string> = {
  MEDICAL: 'red',
  LEGAL: 'blue',
  FINANCE: 'gold',
  ENGINEERING: 'green',
  IT: 'purple',
  SCIENCE: 'cyan',
  BUSINESS: 'volcano',
  EDUCATION: 'geekblue',
  DEFAULT: 'default',
};

interface StdResponse {
  originalTerm: string;
  standardTerm: string;
  domain: string;
  start: number;
  end: number;
  reason: string;
  confidence: number;
}

const TermStandardizationPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [standardizedContent, setStandardizedContent] =
    useState<React.ReactNode>(null);
  const [stats, setStats] = useState({
    totalTerms: 0,
    standardizedTerms: 0,
    domains: {} as Record<string, number>,
  });

  const extractStd = (text: string): Promise<StdResponse[]> => {
    const data = {
      text: text,
    };

    return fetch('http://127.0.0.1:8001/api/std', {
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
      .then((data: any[]): StdResponse[] => {
        return data.map((item) => ({
          originalTerm: item.original,
          standardTerm: item.standard,
          domain: '金融',
          start: item.start,
          end: item.end,
          reason: '金融专业术语',
          confidence: item.confidence,
        }));
      });
  };

  // 处理文本提交
  const handleSubmit = async () => {
    if (!inputText.trim()) {
      message.warning('请输入需要进行术语标准化的文本内容');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setStandardizedContent(null);

    try {
      const mockResults = await extractStd(inputText);
      setResults(mockResults);

      // 生成标准化后的内容
      generateStandardizedContent(inputText, mockResults);

      // 计算统计信息
      calculateStats(mockResults);

      if (mockResults.length === 0) {
        message.info('未检测到需要标准化的术语');
      } else {
        message.success(`成功标准化 ${mockResults.length} 个专业术语`);
      }
    } catch (err) {
      setError('术语标准化服务暂时不可用，请稍后重试');
      message.error('术语标准化失败');
    } finally {
      setLoading(false);
    }
  };

  // 生成标准化后的内容
  const generateStandardizedContent = (text: string, terms: any[]) => {
    if (!terms.length) {
      setStandardizedContent(text);
      return;
    }

    // 按起始位置排序术语
    const sortedTerms = [...terms].sort((a, b) => a.start - b.start);
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedTerms.forEach((term, index) => {
      // 添加术语前的普通文本
      if (term.start > lastIndex) {
        parts.push(text.substring(lastIndex, term.start));
      }

      // 添加标准化术语
      const domain = term.domain || 'DEFAULT';
      const color = TERM_DOMAIN_COLORS[domain] || 'default';

      parts.push(
        <span
          key={`term-${index}`}
          className={`px-1 rounded mx-0.5 font-medium border relative group cursor-pointer`}
          style={{
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            backgroundColor: color !== 'default' ? undefined : '#f0f0f0',
          }}
          title={`标准术语: ${term.standardTerm} (${domain})`}
        >
          {text.substring(term.start, term.end)}
          <sup className="ml-1 text-xs opacity-70">
            <Tag
              color={color}
              className="m-0 px-1.5 py-0 h-auto text-[0.65em] font-medium"
            >
              {term.standardTerm}
            </Tag>
          </sup>
          <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
            <div className="font-medium">标准术语: {term.standardTerm}</div>
            <div className="text-gray-300">领域: {domain.toLowerCase()}</div>
            <div className="text-gray-400 text-[0.75em] mt-1">
              {term.reason}
            </div>
          </div>
        </span>,
      );

      lastIndex = term.end;
    });

    // 添加剩余文本
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    setStandardizedContent(parts);
  };

  // 计算统计信息
  const calculateStats = (terms: any[]) => {
    const domains: Record<string, number> = {};
    let totalDomains = 0;

    terms.forEach((term) => {
      const domain = term.domain || 'DEFAULT';
      domains[domain] = (domains[domain] || 0) + 1;
      totalDomains++;
    });

    setStats({
      totalTerms: terms.length,
      standardizedTerms: terms.filter((t) => t.standardTerm !== t.originalTerm)
        .length,
      domains,
    });
  };

  // 模拟术语标准化逻辑
  const standardizeTerms = (text: string): any[] => {
    const terms: any[] = [];
    const lowerText = text.toLowerCase();

    // 医学术语示例
    const medicalTerms = [
      {
        pattern: /心梗/g,
        standard: '心肌梗死',
        domain: 'MEDICAL',
        reason: '标准医学术语',
      },
      {
        pattern: /心梗塞/g,
        standard: '心肌梗死',
        domain: 'MEDICAL',
        reason: '标准医学术语',
      },
      {
        pattern: /脑梗/g,
        standard: '脑梗死',
        domain: 'MEDICAL',
        reason: '标准医学术语',
      },
      {
        pattern: /心衰/g,
        standard: '心力衰竭',
        domain: 'MEDICAL',
        reason: '标准医学术语',
      },
      {
        pattern: /高血压/g,
        standard: '高血压病',
        domain: 'MEDICAL',
        reason: '标准医学术语',
      },
    ];

    // 法律术语示例
    const legalTerms = [
      {
        pattern: /被告方/g,
        standard: '被告',
        domain: 'LEGAL',
        reason: '法律文书标准用语',
      },
      {
        pattern: /原告方/g,
        standard: '原告',
        domain: 'LEGAL',
        reason: '法律文书标准用语',
      },
      {
        pattern: /上诉人/g,
        standard: '上诉方',
        domain: 'LEGAL',
        reason: '法律文书标准用语',
      },
      {
        pattern: /被上诉人/g,
        standard: '被上诉方',
        domain: 'LEGAL',
        reason: '法律文书标准用语',
      },
    ];

    // IT术语示例
    const itTerms = [
      {
        pattern: /云端/g,
        standard: '云平台',
        domain: 'IT',
        reason: '技术文档标准术语',
      },
      {
        pattern: /大数据/g,
        standard: '海量数据',
        domain: 'IT',
        reason: '技术文档标准术语',
      },
      {
        pattern: /AI/g,
        standard: '人工智能',
        domain: 'IT',
        reason: '技术文档标准术语',
      },
      {
        pattern: /机器学习/g,
        standard: 'ML',
        domain: 'IT',
        reason: '技术文档缩写标准',
      },
    ];

    // 匹配医学术语
    medicalTerms.forEach((term) => {
      const matches = [...text.matchAll(term.pattern)];
      matches.forEach((match) => {
        if (match.index !== undefined) {
          terms.push({
            originalTerm: match[0],
            standardTerm: term.standard,
            domain: term.domain,
            start: match.index,
            end: match.index + match[0].length,
            confidence: 0.92 + Math.random() * 0.08,
            reason: term.reason,
          });
        }
      });
    });

    // 匹配法律术语
    legalTerms.forEach((term) => {
      const matches = [...text.matchAll(term.pattern)];
      matches.forEach((match) => {
        if (match.index !== undefined) {
          terms.push({
            originalTerm: match[0],
            standardTerm: term.standard,
            domain: term.domain,
            start: match.index,
            end: match.index + match[0].length,
            confidence: 0.85 + Math.random() * 0.15,
            reason: term.reason,
          });
        }
      });
    });

    // 匹配IT术语
    itTerms.forEach((term) => {
      const matches = [...text.matchAll(term.pattern)];
      matches.forEach((match) => {
        if (match.index !== undefined) {
          terms.push({
            originalTerm: match[0],
            standardTerm: term.standard,
            domain: term.domain,
            start: match.index,
            end: match.index + match[0].length,
            confidence: 0.88 + Math.random() * 0.12,
            reason: term.reason,
          });
        }
      });
    });

    return terms;
  };

  // 清空输入
  const handleClear = () => {
    setInputText('');
    setResults([]);
    setStandardizedContent(null);
    setError(null);
    setStats({
      totalTerms: 0,
      standardizedTerms: 0,
      domains: {},
    });
  };

  // 表格列配置
  const columns = [
    {
      title: '原始术语',
      dataIndex: 'originalTerm',
      key: 'originalTerm',
      width: 180,
      render: (text: string) => (
        <div className="font-medium text-gray-800">{text}</div>
      ),
    },
    {
      title: '标准术语',
      dataIndex: 'standardTerm',
      key: 'standardTerm',
      width: 180,
      render: (text: string) => (
        <div className="font-medium text-blue-600 flex items-center">
          <SwapOutlined className="mr-2 text-blue-500" />
          {text}
        </div>
      ),
    },
    {
      title: '术语领域',
      dataIndex: 'domain',
      key: 'domain',
      width: 150,
      render: (domain: string) => {
        const color = TERM_DOMAIN_COLORS[domain] || 'default';
        return (
          <Tag
            color={color}
            className="px-2 py-0.5 text-sm font-medium border"
            style={{
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              backgroundColor: color !== 'default' ? undefined : '#f0f0f0',
            }}
          >
            {domain}
          </Tag>
        );
      },
    },
    {
      title: '替换原因',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => (
        <Text ellipsis={{ tooltip: reason }} className="text-gray-600 max-w-xs">
          {reason}
        </Text>
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
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-purple-100 rounded-2xl">
            <BookOutlined className="text-3xl text-purple-600" />
          </div>
          <Title level={2} className="mb-4 text-gray-800">
            金融专业术语标准化
          </Title>
          <Text type="secondary" className="text-lg max-w-2xl mx-auto">
            输入文本内容，系统将自动识别并标准化金融领域的专业术语
          </Text>
        </div>

        {/* 统计卡片 */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-md rounded-xl overflow-hidden border border-gray-100">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
                    <BookOutlined className="text-xl text-blue-600" />
                  </div>
                  <div>
                    <Title level={4} className="m-0 text-gray-500">
                      检测到的术语
                    </Title>
                    <Text className="text-2xl font-bold text-gray-800">
                      {stats.totalTerms}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="shadow-md rounded-xl overflow-hidden border border-gray-100">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-4">
                    <SwapOutlined className="text-xl text-green-600" />
                  </div>
                  <div>
                    <Title level={4} className="m-0 text-gray-500">
                      已标准化术语
                    </Title>
                    <Text className="text-2xl font-bold text-gray-800">
                      {stats.standardizedTerms}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="shadow-md rounded-xl overflow-hidden border border-gray-100">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mr-4">
                    <CheckCircleOutlined className="text-xl text-purple-600" />
                  </div>
                  <div>
                    <Title level={4} className="m-0 text-gray-500">
                      覆盖领域
                    </Title>
                    <Text className="text-2xl font-bold text-gray-800">
                      {Object.keys(stats.domains).length}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        <Card
          className="shadow-xl rounded-2xl overflow-hidden border-none"
          bodyStyle={{ padding: 0 }}
        >
          {/* 输入区域 */}
          <div className="p-6 border-b border-gray-100 bg-white rounded-t-2xl">
            <div className="flex flex-col md:flex-row gap-4">
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
                  placeholder="在此输入需要进行术语标准化的文本内容..."
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
                  {loading ? '标准化中...' : '开始标准化'}
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

          {/* 标准化结果区域 */}
          {standardizedContent !== null && (
            <div className="p-6 border-b border-gray-100 bg-white">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Title level={4} className="m-0 text-gray-800 mr-3">
                    标准化结果
                  </Title>
                  <Badge
                    count={results.length}
                    className="mt-1"
                    style={{ backgroundColor: '#52c41a' }}
                  />
                </div>
                <div className="flex space-x-2">
                  {Object.entries(stats.domains).map(([domain, count]) => {
                    const color = TERM_DOMAIN_COLORS[domain] || 'default';
                    return (
                      <Tag
                        key={domain}
                        color={color}
                        className="px-2 py-0.5 text-sm font-medium border"
                      >
                        {domain}: {count}
                      </Tag>
                    );
                  })}
                </div>
              </div>
              <div
                className="p-5 bg-gray-50 rounded-xl min-h-[120px] leading-loose text-gray-800 border border-gray-200"
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: '1.75',
                }}
              >
                {standardizedContent}
              </div>
            </div>
          )}

          {/* 术语映射表格 */}
          {results.length > 0 && (
            <div className="p-6 bg-white rounded-b-2xl">
              <div className="flex justify-between items-center mb-4">
                <Title level={4} className="m-0 text-gray-800">
                  术语映射详情
                </Title>
                <Text type="secondary" className="text-gray-600">
                  共 {results.length} 个术语映射关系
                </Text>
              </div>
              <Table
                dataSource={results}
                columns={columns}
                rowKey={(record, index) => `${record.start}-${index}`}
                pagination={{
                  pageSize: 8,
                  showSizeChanger: true,
                  pageSizeOptions: ['5', '8', '15'],
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
          {!loading && standardizedContent === null && (
            <div className="p-12 text-center bg-white rounded-b-2xl">
              <div className="inline-block p-6 rounded-full bg-gray-100 mb-6">
                <BookOutlined className="text-4xl text-gray-400" />
              </div>
              <Title level={4} className="mb-2 text-gray-800">
                等待标准化结果
              </Title>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TermStandardizationPage;
