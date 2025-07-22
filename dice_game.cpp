#include <iostream>
#include <vector>
#include <cstdlib>
#include <ctime>
using namespace std;

// Player class
class Player {
public:
    string name;
    int score;

    Player(string name) {
        this->name = name;
        score = 0;
    }

    void addScore(int val) {
        score += val;
    }

    bool hasWon(int target) {
        return score >= target;
    }
};

// Dice class
class Dice {
public:
    int roll() {
        return (rand() % 6) + 1;
    }
};

// DiceGame class
class DiceGame {
private:
    vector<Player> players;
    Dice dice;
    int targetScore;

public:
    DiceGame(int numPlayers, int target) {
        targetScore = target;
        for (int i = 0; i < numPlayers; i++) {
            string name;
            cout << "Enter name of Player " << (i + 1) << ": ";
            cin >> name;
            players.push_back(Player(name));
        }
    }

    void playGame() {
    bool gameOver = false;
    int turn = 0;
    cin.ignore();

    while (!gameOver) {
        Player &currentPlayer = players[turn];
        bool extraTurn;

        do {
            extraTurn = false;

            cout << currentPlayer.name << "'s turn. Press Enter to roll the dice..." << endl;
            cin.get();

            int diceVal = dice.roll();
            cout << currentPlayer.name << " rolled a " << diceVal << "!" << endl;

            currentPlayer.addScore(diceVal);
            cout << "Score of " << currentPlayer.name << ": " << currentPlayer.score << endl;

            // Leaderboard display
            Player* leader = &players[0];
            for (Player& p : players) {
                if (p.score > leader->score) {
                    leader = &p;
                }
            }
            cout << "Current Leader: " << leader->name << " with score " << leader->score << "\n" << endl;

            if (currentPlayer.hasWon(targetScore)) {
                cout << "\n Game Over!\n";
                cout << currentPlayer.name << " has reached the target score!" << endl;

                // Show all winners
                for (Player& p : players) {
                    if (p.hasWon(targetScore)) {
                        cout << " Congratulations " << p.name << "! Final Score: " << p.score << endl;
                    }
                }
                gameOver = true;
                break;
            }

            if (diceVal == 6) {
                cout << "Rolled a 6! " << currentPlayer.name << " gets another turn!\n";
                extraTurn = true;
            }

        } while (extraTurn);

        // Move to next player only if no extra turn
        if (!extraTurn) {
            turn = (turn + 1) % players.size();
        }
    }
}

};


// Main function
int main() {
    srand(time(0));
    int numPlayers, targetScore;

    cout << "Welcome to the Dice Game!" << endl;
    cout << "Enter number of players: ";
    cin >> numPlayers;
    cout << "Enter target score to win: ";
    cin >> targetScore;
    cin.ignore(); // Clear the input buffer

    DiceGame game(numPlayers, targetScore);
    game.playGame();

    return 0;
}