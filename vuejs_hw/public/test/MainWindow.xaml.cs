using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using System.Windows.Threading;

namespace Match_Game;

/// <summary>
/// Interaction logic for MainWindow.xaml
/// </summary>
public partial class MainWindow : Window
{
    // 記錄玩家按的第一個動物 - 將其設置為可為 null 的類型
    TextBlock? lastTextBlockClicked;
    // 記錄玩家是否已經按了第一個動物
    bool findingMatch = false;
    DispatcherTimer timer = new DispatcherTimer();
    int tenthsOfSecondsElapsed;
    int matchesFound;
    bool gameStarted = false;
    
    public MainWindow()
    {
        InitializeComponent();
        timer.Interval = TimeSpan.FromSeconds(.1);
        timer.Tick += Timer_Tick;
        PrepareGame();
    }

    private void Timer_Tick(object? sender, EventArgs e)
    {
        //每 0.1 秒增加一次計數器
        tenthsOfSecondsElapsed++; 
        //將計數器值除以 10 並格式化為一位小數來顯示秒數 EX: 3.5s
        timeTextBlock.Text = (tenthsOfSecondsElapsed / 10F).ToString("0.0s"); 
        if(matchesFound == 8)
        {
            timer.Stop(); //停止計時器，不再計時
            timeTextBlock.Text = timeTextBlock.Text + " - Play again?";
            gameStarted = false; // 將遊戲狀態設為未開始
            resetTextBlock.Visibility = Visibility.Collapsed; // 遊戲結束時隱藏重置按鈕
        }
    }

    private void PrepareGame()
    {
        // 隱藏所有動物
        foreach (TextBlock textBlock in mainGrid.Children.OfType<TextBlock>())
        {
            if (textBlock.Name != "timeTextBlock" && textBlock.Name != "resetTextBlock")
            {
                textBlock.Text = "?";
                textBlock.Visibility = Visibility.Visible;
            }
        }
        
        timeTextBlock.Text = "Start Game";
        resetTextBlock.Visibility = Visibility.Collapsed; // 準備遊戲時隱藏重置按鈕
        tenthsOfSecondsElapsed = 0;
        matchesFound = 0;
        gameStarted = false;
    }

    private void SetUpGame()
    {
        gameStarted = true;
        resetTextBlock.Visibility = Visibility.Visible; // 遊戲開始時顯示重置按鈕
        
        List<string> animalEmoji = new List<string>()
        {
            "🐘", "🐘",
            "🦅", "🦅",
            "🦘", "🦘",
            "🦑", "🦑",
            "🦁", "🦁",
            "🐨", "🐨",
            "🐒", "🐒",
            "🐳", "🐳",
        };
        Random random = new Random();
        foreach (TextBlock textBlock in mainGrid.Children.OfType<TextBlock>())
        {
            if(textBlock.Name != "timeTextBlock" && textBlock.Name != "resetTextBlock")
            {
                textBlock.Visibility = Visibility.Visible;
                int index = random.Next(animalEmoji.Count);
                string nextEmoji = animalEmoji[index];
                textBlock.Text = nextEmoji;
                animalEmoji.RemoveAt(index);
            }
        }
        timer.Start();
        tenthsOfSecondsElapsed = 0;
        matchesFound = 0;
        findingMatch = false;
        lastTextBlockClicked = null; // 初始化為 null
    }

    private void TextBlock_MouseDown(object sender, MouseButtonEventArgs e)
    {
        if (!gameStarted)
            return;
            
        if (sender is not TextBlock textBlock)
            return;
            
        if (findingMatch == false)
        {
            // 第一次按，將第一個動物隱藏，並記錄TextBlock
            textBlock.Visibility = Visibility.Hidden;
            lastTextBlockClicked = textBlock;
            findingMatch = true;
        }
        else if (lastTextBlockClicked != null && textBlock.Text == lastTextBlockClicked.Text)
        {
            // 配對成功，並也把第二個動物隱藏，然後重設findingMatch 
            matchesFound++;
            textBlock.Visibility = Visibility.Hidden;
            findingMatch = false;
        }
        else
        {
            // 配對失敗，把第一個動物顯示，然後重設findingMatch 
            if (lastTextBlockClicked != null)
                lastTextBlockClicked.Visibility = Visibility.Visible;
            findingMatch = false;
        }
    }

    private void TimeTextBlock_MouseDown(object sender, MouseButtonEventArgs e)
    {
        if (matchesFound == 8)
        {
            PrepareGame();
        }
        else if (!gameStarted)
        {
            SetUpGame();
        }
    }
    
    // 新增重置按鈕點擊事件處理程序
    private void ResetTextBlock_MouseDown(object sender, MouseButtonEventArgs e)
    {
        // 停止計時器並回到準備開始的畫面
        timer.Stop();
        PrepareGame();
    }
    
    // StartButton_Click 方法可以保留，但不會再被使用
    private void StartButton_Click(object sender, RoutedEventArgs e)
    {
        SetUpGame();
    }
}