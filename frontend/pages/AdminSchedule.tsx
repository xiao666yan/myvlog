import React, { useState, useRef } from 'react';
import {
  Clock, Sun, Moon, Calendar, BookOpen,
  Dumbbell, Coffee, AlertCircle, CheckCircle2,
  ChevronDown, ChevronRight, Sparkles,
  Upload, FileSpreadsheet, X, Check
} from 'lucide-react';

interface ScheduleItem {
  date: string;
  day: string;
  shift: string;
  note: string;
}

interface ScheduleProps {
  onBack?: () => void;
}

// 默认3月份日程表
const defaultMarchSchedule: ScheduleItem[] = [
  { date: '3月1日', day: '星期日', shift: 'A班', note: '下午15点开始学习，傍晚安排跑步。' },
  { date: '3月2日', day: '星期一', shift: 'A班', note: '下午15点开始学习，傍晚安排力量训练。' },
  { date: '3月3日', day: '星期二', shift: 'A班', note: '下午15点开始学习，傍晚休息或拉伸。' },
  { date: '3月4日', day: '星期三', shift: '休息', note: '冲刺日！执行10小时学习，傍晚跑步。' },
  { date: '3月5日', day: '星期四', shift: '休息', note: '冲刺日！执行10小时学习，傍晚力量训练。' },
  { date: '3月6日', day: '星期五', shift: 'B班', note: '上午黄金3小时学习，13:00务必午睡半小时。' },
  { date: '3月7日', day: '星期六', shift: 'B班', note: '上午学习+跑步，13:00务必午睡半小时。' },
  { date: '3月8日', day: '星期日', shift: 'C班', note: '白天安心工作，晚上19:30开启3小时沉浸学习。' },
  { date: '3月9日', day: '星期一', shift: 'A班', note: '恢复早起，下午15点开始学习，傍晚力量训练。' },
  { date: '3月10日', day: '星期二', shift: '休息', note: '冲刺日！执行10小时学习，傍晚跑步。' },
  { date: '3月11日', day: '星期三', shift: '休息', note: '冲刺日！执行10小时学习，傍晚力量训练。' },
  { date: '3月12日', day: '星期四', shift: 'B班', note: '上午学习，13:00午睡半小时备战下午工作。' },
  { date: '3月13日', day: '星期五', shift: 'C班', note: '晚上19:30开始学习，注意12点下班抓紧去食堂。' },
  { date: '3月14日', day: '星期六', shift: 'A班', note: '下午15点开始学习，傍晚安排跑步。' },
  { date: '3月15日', day: '星期日', shift: 'A班', note: '下午15点开始学习，傍晚安排力量训练。' },
  { date: '3月16日', day: '星期一', shift: '休息', note: '冲刺日！执行10小时学习，傍晚休息或拉伸。' },
  { date: '3月17日', day: '星期二', shift: 'B班', note: '上午学习+跑步，13:00午睡半小时。' },
  { date: '3月18日', day: '星期三', shift: 'B班', note: '上午学习，13:00午睡半小时。' },
  { date: '3月19日', day: '星期四', shift: 'A班', note: '下午15点开始学习，傍晚安排力量训练。' },
  { date: '3月20日', day: '星期五', shift: 'A班', note: '下午15点开始学习，傍晚安排跑步。' },
  { date: '3月21日', day: '星期六', shift: '休息', note: '冲刺日！执行10小时学习，傍晚力量训练。' },
  { date: '3月22日', day: '星期日', shift: '休息', note: '冲刺日！执行10小时学习，傍晚跑步。' },
  { date: '3月23日', day: '星期一', shift: 'B班', note: '上午学习，13:00午睡半小时。' },
  { date: '3月24日', day: '星期二', shift: 'A班', note: '下午15点开始学习，傍晚安排力量训练。' },
  { date: '3月25日', day: '星期三', shift: 'B班', note: '上午学习+跑步，13:00午睡半小时。' },
  { date: '3月26日', day: '星期四', shift: 'A班', note: '下午15点开始学习，傍晚休息或拉伸。' },
  { date: '3月27日', day: '星期五', shift: '休息', note: '冲刺日！执行10小时学习，傍晚力量训练。' },
  { date: '3月28日', day: '星期六', shift: 'B班', note: '上午学习，13:00午睡半小时。' },
  { date: '3月29日', day: '星期日', shift: 'C班', note: '晚上19:30开始学习，傍晚下班后可安排跑步。' },
  { date: '3月30日', day: '星期一', shift: 'A班', note: '下午15点开始学习，傍晚安排力量训练。' },
  { date: '3月31日', day: '星期二', shift: 'A班', note: '下午15点开始学习，月底复盘3月学习进度。' }
];

const AdminSchedule: React.FC<ScheduleProps> = ({ onBack }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('principles');
  const [selectedShift, setSelectedShift] = useState<string>('A');
  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>(defaultMarchSchedule);
  const [currentMonth, setCurrentMonth] = useState<string>('2026年3月');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // 解析CSV文件
  const parseCSV = (content: string): ScheduleItem[] => {
    const lines = content.trim().split('\n');
    const items: ScheduleItem[] = [];

    // 跳过标题行
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // 处理CSV中的引号
      const parts: string[] = [];
      let current = '';
      let inQuotes = false;

      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          parts.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      parts.push(current.trim());

      if (parts.length >= 3) {
        const [date, day, shift, ...noteParts] = parts;
        const note = noteParts.join(',').replace(/^"|"$/g, '');

        items.push({
          date: date.replace(/^"|"$/g, ''),
          day: day.replace(/^"|"$/g, ''),
          shift: shift.replace(/^"|"$/g, ''),
          note: note || getDefaultNote(shift.replace(/^"|"$/g, ''))
        });
      }
    }

    return items;
  };

  // 根据班次获取默认提示
  const getDefaultNote = (shift: string): string => {
    switch (shift) {
      case 'A班':
        return '下午15点开始学习，合理安排锻炼。';
      case 'B班':
        return '上午黄金3小时学习，13:00务必午睡半小时。';
      case 'C班':
        return '晚上19:30开始学习，注意12点下班抓紧去食堂。';
      case '休息':
        return '冲刺日！执行10小时学习，合理安排锻炼。';
      default:
        return '根据班次模板执行学习计划。';
    }
  };

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const content = await file.text();
      let newSchedule: ScheduleItem[] = [];

      if (file.name.endsWith('.csv')) {
        newSchedule = parseCSV(content);
      } else if (file.name.endsWith('.txt')) {
        // 简单的文本格式：日期,星期,班次,备注
        newSchedule = parseCSV(content);
      } else {
        throw new Error('不支持的文件格式，请上传CSV文件');
      }

      if (newSchedule.length === 0) {
        throw new Error('未能解析到有效的排班数据');
      }

      setScheduleData(newSchedule);
      setCurrentMonth(file.name.replace(/\.[^/.]+$/, ''));
      setUploadSuccess(true);

      // 3秒后隐藏成功提示
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '文件解析失败');
    } finally {
      setIsUploading(false);
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 下载模板
  const downloadTemplate = () => {
    const template = `日期,星期,班次,备注
3月1日,星期日,A班,下午15点开始学习，傍晚安排跑步。
3月2日,星期一,A班,下午15点开始学习，傍晚安排力量训练。
3月3日,星期二,B班,上午黄金3小时学习，13:00务必午睡半小时。
3月4日,星期三,休息,冲刺日！执行10小时学习，傍晚跑步。
3月5日,星期四,C班,晚上19:30开始学习，注意12点下班抓紧去食堂。`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '排班表模板.csv';
    link.click();
  };

  // 核心执行原则
  const principles = [
    {
      icon: <Clock className="w-5 h-5 text-blue-500" />,
      title: '番茄工作法',
      content: '所有"学习时段"均建议采用 50分钟学习 + 10分钟休息 的模式，不要连续久坐，休息时可以站起来走动、喝水或闭目养神。'
    },
    {
      icon: <Coffee className="w-5 h-5 text-orange-500" />,
      title: '食堂时间踩点',
      content: '早餐（06:00-08:00）：B班、C班、休息日安排在 07:00-07:30。午餐（11:00-12:00）：B班、休息日安排在 11:30-12:00；C班中午12点下班，需在11:50左右提前去食堂或12点准时冲刺。晚餐（17:00-18:00）：A班、休息日安排在 17:00-17:30；C班安排在 17:30-18:00。'
    },
    {
      icon: <Dumbbell className="w-5 h-5 text-green-500" />,
      title: '锻炼安排',
      content: '每周穿插跑步（有氧）和力量训练，不仅能保持体型，更能为后期高强度备考储备体能。'
    },
    {
      icon: <Moon className="w-5 h-5 text-purple-500" />,
      title: '睡眠保障',
      content: '尽量保证每天 6.5-7.5 小时的夜间睡眠，B班严格执行班前30分钟午休。'
    }
  ];

  // 四类班次模板
  const shiftTemplates = {
    A: {
      name: 'A班',
      time: '早06:30 - 午14:00',
      color: 'bg-red-100 text-red-700 border-red-200',
      features: '下午和晚上有大段完整学习时间。早午饭在工作时间解决。',
      schedule: [
        { time: '05:40 - 06:30', activity: '起床洗漱，通勤上班', type: 'life' },
        { time: '06:30 - 14:00', activity: '【工作时段】（期间解决早饭、午饭）', type: 'work' },
        { time: '14:00 - 15:00', activity: '下班通勤，午休小憩（恢复早起的疲惫）', type: 'rest' },
        { time: '15:00 - 17:00', activity: '【学习模块一】（2小时，建议安排数学/专业课等需要深度思考的科目）', type: 'study' },
        { time: '17:00 - 17:30', activity: '【晚餐】（食堂）', type: 'life' },
        { time: '17:30 - 18:30', activity: '【锻炼】跑步或力量训练 + 洗澡放松', type: 'exercise' },
        { time: '18:30 - 21:30', activity: '【学习模块二】（3小时，建议安排英语阅读/专业课）', type: 'study' },
        { time: '21:30 - 22:30', activity: '【复盘与背诵】背单词、复习当天错题', type: 'study' },
        { time: '22:30 - 23:00', activity: '洗漱，准备入睡', type: 'life' }
      ],
      totalStudy: '5.5 小时'
    },
    B: {
      name: 'B班',
      time: '午14:00 - 晚21:00',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      features: '上午是黄金学习期，晚上较疲惫。',
      schedule: [
        { time: '06:40 - 07:00', activity: '起床洗漱', type: 'life' },
        { time: '07:00 - 07:30', activity: '【早餐】（食堂）', type: 'life' },
        { time: '07:30 - 10:30', activity: '【学习模块一】（3小时，攻克最难的科目，如数学/专业课）', type: 'study' },
        { time: '10:30 - 11:30', activity: '【锻炼】跑步或力量训练 + 冲凉', type: 'exercise' },
        { time: '11:30 - 12:00', activity: '【午餐】（食堂）', type: 'life' },
        { time: '12:00 - 13:00', activity: '【学习模块二】（1小时，英语单词/长难句等相对轻松的任务）', type: 'study' },
        { time: '13:00 - 13:30', activity: '【强制午睡】（满足B班前睡半小时需求，保证下午精力）', type: 'rest' },
        { time: '13:30 - 14:00', activity: '起床清醒，通勤上班', type: 'life' },
        { time: '14:00 - 21:00', activity: '【工作时段】（可在工作间隙解决晚餐或吃点简餐）', type: 'work' },
        { time: '21:00 - 22:00', activity: '下班通勤，洗漱放松', type: 'life' },
        { time: '22:00 - 23:00', activity: '【轻度学习】复盘当天内容，听听网课或背单词', type: 'study' },
        { time: '23:00', activity: '入睡', type: 'life' }
      ],
      totalStudy: '4.5 小时'
    },
    C: {
      name: 'C班',
      time: '早08:00 - 午12:00，午14:00 - 晚17:30',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      features: '类似正常长白班，学习时间主要集中在晚上。',
      schedule: [
        { time: '06:40 - 07:00', activity: '起床洗漱', type: 'life' },
        { time: '07:00 - 07:30', activity: '【早餐】（食堂）', type: 'life' },
        { time: '07:30 - 08:00', activity: '通勤上班', type: 'life' },
        { time: '08:00 - 12:00', activity: '【工作时段】', type: 'work' },
        { time: '12:00 - 12:30', activity: '【午餐】（12点下班立刻去食堂，或提前打包）', type: 'life' },
        { time: '12:30 - 13:30', activity: '午休小憩', type: 'rest' },
        { time: '13:30 - 14:00', activity: '准备下午工作', type: 'life' },
        { time: '14:00 - 17:30', activity: '【工作时段】', type: 'work' },
        { time: '17:30 - 18:00', activity: '【晚餐】（食堂）', type: 'life' },
        { time: '18:00 - 19:30', activity: '【锻炼】跑步/力量训练 + 洗澡休息', type: 'exercise' },
        { time: '19:30 - 22:30', activity: '【学习模块一】（3小时，集中精力攻克核心科目）', type: 'study' },
        { time: '22:30 - 23:00', activity: '背单词，洗漱入睡', type: 'life' }
      ],
      totalStudy: '3.5 小时'
    },
    rest: {
      name: '休息日',
      time: '全天自由',
      color: 'bg-green-100 text-green-700 border-green-200',
      features: '拉开差距的关键时期，全天沉浸式学习。',
      schedule: [
        { time: '07:00 - 07:30', activity: '起床洗漱', type: 'life' },
        { time: '07:30 - 08:00', activity: '【早餐】（食堂）', type: 'life' },
        { time: '08:00 - 11:30', activity: '【学习模块一】（3.5小时，数学/专业课）', type: 'study' },
        { time: '11:30 - 12:00', activity: '【午餐】（食堂）', type: 'life' },
        { time: '12:00 - 13:30', activity: '午休（睡眠30-40分钟即可，避免进入深度睡眠）', type: 'rest' },
        { time: '13:30 - 17:00', activity: '【学习模块二】（3.5小时，英语/专业课）', type: 'study' },
        { time: '17:00 - 17:30', activity: '【晚餐】（食堂）', type: 'life' },
        { time: '17:30 - 19:00', activity: '【锻炼】周末可安排较长时间的户外跑步或系统力量训练 + 洗澡', type: 'exercise' },
        { time: '19:00 - 22:00', activity: '【学习模块三】（3小时，整理笔记，消化一周难点）', type: 'study' },
        { time: '22:00 - 23:00', activity: '复盘、背单词、放松', type: 'life' }
      ],
      totalStudy: '10 小时'
    }
  };

  const getShiftColor = (shift: string) => {
    switch(shift) {
      case 'A班': return 'bg-red-100 text-red-700';
      case 'B班': return 'bg-blue-100 text-blue-700';
      case 'C班': return 'bg-yellow-100 text-yellow-700';
      case '休息': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch(type) {
      case 'study': return 'bg-indigo-50 border-l-4 border-indigo-500 text-indigo-700';
      case 'work': return 'bg-orange-50 border-l-4 border-orange-500 text-orange-700';
      case 'exercise': return 'bg-green-50 border-l-4 border-green-500 text-green-700';
      case 'rest': return 'bg-purple-50 border-l-4 border-purple-500 text-purple-700';
      case 'life': return 'bg-gray-50 border-l-4 border-gray-400 text-gray-600';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-primary-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentMonth}在职考研时间规划
              </h1>
            </div>
            {/* 文件上传区域 */}
            <div className="flex items-center space-x-3">
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={downloadTemplate}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                下载模板
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>上传中...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>上传排班表</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            科学规划每一天，平衡工作与学习，助力考研成功
          </p>
          
          {/* 上传状态提示 */}
          {uploadSuccess && (
            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center space-x-2 text-green-700 dark:text-green-400">
              <Check className="w-5 h-5" />
              <span>排班表上传成功！日程已更新。</span>
            </div>
          )}
          {uploadError && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center space-x-2 text-red-700 dark:text-red-400">
              <X className="w-5 h-5" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* 核心执行原则 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection('principles')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20"
          >
            <div className="flex items-center space-x-3">
              <Sparkles className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">核心执行原则</h2>
            </div>
            {expandedSection === 'principles' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          
          {expandedSection === 'principles' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {principles.map((principle, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center shadow-sm">
                    {principle.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{principle.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{principle.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 班次模板选择 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">四类班次标准作息模板</h2>
            </div>
          </div>
          
          <div className="p-6">
            {/* 班次选择按钮 */}
            <div className="flex flex-wrap gap-3 mb-6">
              {Object.entries(shiftTemplates).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => setSelectedShift(key)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    selectedShift === key 
                      ? template.color + ' ring-2 ring-offset-2 ring-primary-500' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {template.name}
                </button>
              ))}
            </div>

            {/* 当前选中班次详情 */}
            {selectedShift && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className={`px-4 py-3 ${shiftTemplates[selectedShift as keyof typeof shiftTemplates].color} border-b`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-lg">{shiftTemplates[selectedShift as keyof typeof shiftTemplates].name}</span>
                      <span className="ml-3 text-sm opacity-80">{shiftTemplates[selectedShift as keyof typeof shiftTemplates].time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-sm font-semibold">净学习: {shiftTemplates[selectedShift as keyof typeof shiftTemplates].totalStudy}</span>
                    </div>
                  </div>
                  <p className="text-sm mt-1 opacity-80">{shiftTemplates[selectedShift as keyof typeof shiftTemplates].features}</p>
                </div>
                
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {shiftTemplates[selectedShift as keyof typeof shiftTemplates].schedule.map((item, index) => (
                    <div key={index} className={`px-4 py-3 ${getActivityTypeColor(item.type)}`}>
                      <div className="flex items-start space-x-4">
                        <span className="flex-shrink-0 w-24 text-sm font-mono font-semibold opacity-70">{item.time}</span>
                        <span className="text-sm flex-1">{item.activity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3月份日程表 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection('schedule')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
          >
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentMonth}每日执行日程表</h2>
            </div>
            {expandedSection === 'schedule' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>

          {expandedSection === 'schedule' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {scheduleData.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white">{item.date}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{item.day}</span>
                    </div>
                    <span className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold mb-2 ${getShiftColor(item.shift)}`}>
                      {item.shift}
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 备考小贴士 */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">备考小贴士</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">弹性调整：</span>在职考研难免遇到加班或极度疲惫的情况。如果某天实在太累，允许自己减少1小时学习时间去睡觉，<span className="text-amber-600 font-semibold">保持长期的可持续性比一两天的死磕更重要</span>。
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">碎片时间：</span>A班和C班的通勤路上、工作摸鱼间隙，可以使用手机APP（如墨墨背单词、不背单词）刷词汇，积少成多。
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">锻炼建议：</span>计划表中将锻炼安排在傍晚或上午，能有效缓解久坐带来的腰颈椎疲劳，同时分泌多巴胺缓解考研压力。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSchedule;
